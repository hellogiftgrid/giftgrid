import "server-only";
import { createHash } from "node:crypto";
import { ApiError, developerActor } from "@/lib/developer/api";

// Deliberately disabled until the owner chooses the developer accounts.
// Use profile UUIDs, never public names or client-provided author IDs.
export async function publishingActor(request: Request, scope: "community:publish" | "community:draft") {
  const actor = await developerActor(request, scope);
  const { data, error } = await actor.admin.from("profiles").select("role,full_name").eq("id", actor.ownerId).single();
  if (error) throw new ApiError(503, "Unable to verify publishing access.");
  if (!data) throw new ApiError(403, "A GiftGrid profile is required to publish.");
  return { ...actor, authorName: data.full_name || "GiftGrid member" };
}

export function postInput(input: Record<string, unknown>) {
  const body = typeof input.body === "string" ? input.body.trim() : "";
  const topic = input.topic === undefined ? "General" : typeof input.topic === "string" ? input.topic.trim() : "";
  if (!body || body.length > 2000) throw new ApiError(400, "Write between 1 and 2,000 characters.");
  if (!topic || topic.length > 40) throw new ApiError(400, "Topics must contain 1 to 40 characters.");
  if (["author_id", "author_name", "created_at", "status", "system_key"].some(key => key in input)) {
    throw new ApiError(400, "Author identity, timestamps, and publication status are managed by GiftGrid.");
  }
  return { body, topic };
}

const projection = "id,author_id,author_name,topic,body,created_at,status";
export async function publishPost(actor: Awaited<ReturnType<typeof publishingActor>>, input: Record<string, unknown>, key: string | null) {
  const content = postInput(input);
  if (!key || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
    throw new ApiError(400, "Provide an Idempotency-Key of 8 to 100 letters, digits, underscores, or hyphens.");
  }
  const systemKey = `developer:${actor.ownerId}:${createHash("sha256").update(key).digest("hex")}`;
  const previous = await actor.admin.from("community_posts").select(projection).eq("system_key", systemKey).eq("author_id", actor.ownerId).maybeSingle();
  if (previous.error) throw new ApiError(503, "Unable to check the previous publication.");
  if (previous.data) {
    if (previous.data.body !== content.body || previous.data.topic !== content.topic) throw new ApiError(409, "This Idempotency-Key was already used for different content.");
    return { post: previous.data, replayed: true };
  }

  // Keep third-party scheduled publishing low-volume even if a workflow loops.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recent = await actor.admin.from("community_posts").select("created_at")
    .eq("author_id", actor.ownerId).like("system_key", `developer:${actor.ownerId}:%`)
    .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(3);
  if (recent.error) throw new ApiError(503, "Unable to verify the publishing schedule.");
  if ((recent.data?.length || 0) >= 3) throw new ApiError(429, "Automated community publishing is limited to three posts per 24 hours.");
  if (recent.data?.[0] && Date.now() - Date.parse(recent.data[0].created_at) < 4 * 60 * 60 * 1000) {
    throw new ApiError(429, "Wait at least four hours between automated community posts.");
  }

  const result = await actor.admin.from("community_posts").insert({
    ...content, author_id: actor.ownerId, author_name: actor.authorName, system_key: systemKey, status: "published",
  }).select(projection).single();
  if (!result.error) return { post: result.data, replayed: false };
  if (result.error.code !== "23505") throw new ApiError(503, "Unable to publish the community post.");
  // The unique system_key makes concurrent retries safe without a migration.
  const { data, error } = await actor.admin.from("community_posts").select(projection).eq("system_key", systemKey).eq("author_id", actor.ownerId).single();
  if (error || !data) throw new ApiError(503, "Unable to check the previous publication.");
  if (data.body !== content.body || data.topic !== content.topic) throw new ApiError(409, "This Idempotency-Key was already used for different content.");
  return { post: data, replayed: true };
}

export async function draftPost(input: Record<string, unknown>) {
  const brief = typeof input.brief === "string" ? input.brief.trim() : "";
  if (!brief || brief.length > 8000) throw new ApiError(400, "Provide a brief of 1 to 8,000 characters.");
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new ApiError(503, "AI drafting is not configured.");
  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: process.env.GIFTGRID_COMMUNITY_AI_MODEL || "openai/gpt-oss-20b",
        temperature: 0.4, max_completion_tokens: 2048, response_format: { type: "json_object" },
        messages: [
          { role: "system", content: 'Write one useful GiftGrid community post using the supplied brief as source material. Do not invent customers, testimonials, activity, prices, stock, statistics, or product claims. Do not impersonate a member. Return JSON with body (1-2000 characters) and topic (1-40 characters). This is an editorial draft for review.' },
          { role: "user", content: brief },
        ],
      }),
    });
  } catch { throw new ApiError(503, "AI drafting is temporarily unavailable."); }
  if (!response.ok) throw new ApiError(503, "AI drafting is temporarily unavailable.");
  try {
    const result = await response.json();
    const draft = JSON.parse(result.choices[0].message.content);
    if (!draft || typeof draft !== "object" || Array.isArray(draft)) throw new Error();
    return postInput(draft);
  } catch { throw new ApiError(502, "AI returned an invalid draft. Try again with a clearer brief."); }
}
