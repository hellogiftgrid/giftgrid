import { NextResponse } from "next/server";
import { siteConfig, opportunityCategories, supportedPlatforms, partnerNetwork } from "@/config/branding";

// Server-only — GROQ_API_KEY never reaches the browser. Uses Groq's
// OpenAI-compatible chat completions endpoint.
// Model list / availability can change — check https://console.groq.com/docs/models
// and swap GROQ_MODEL below if this one is retired.
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are the support assistant on ${siteConfig.name}'s website.

About ${siteConfig.name}: ${siteConfig.description}

What it does: reviews a merchant's e-commerce store, then routes qualified merchants toward relevant corporate gifting and buyer opportunities. Merchants apply by signing up; there is no upfront fee unless explicitly stated to them.

Opportunity categories: ${opportunityCategories.join(", ")}.
Store platforms it can review: ${supportedPlatforms.map((p) => p.name).join(", ")}.
Corporate gifting / rewards platforms it routes merchants toward: ${partnerNetwork.map((p) => p.name).join(", ")}.

Rules:
- Answer only questions about ${siteConfig.name}, corporate gifting, merchant applications, or how the platform works.
- Keep answers short — 2-4 sentences, no markdown headers.
- If you don't know something specific (exact review timelines, individual application status, pricing details not stated above), say so plainly and suggest contacting ${siteConfig.supportEmail} or the Contact page instead of guessing.
- Never invent partnership claims, guarantees, or figures not given to you here.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat isn't configured yet — GROQ_API_KEY is missing on the server." },
      { status: 500 }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  // Keep the last 12 turns — plenty for a support widget, keeps requests small.
  const trimmed = incoming.slice(-12).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 2000),
  }));

  if (trimmed.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", res.status, errText);
      return NextResponse.json({ error: "The assistant is having trouble responding right now." }, { status: 502 });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ error: "No response generated." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Something went wrong reaching the assistant." }, { status: 500 });
  }
}
