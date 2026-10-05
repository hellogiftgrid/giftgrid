import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEVELOPER_SCOPES } from "@/lib/developer/scopes";

export class ApiError extends Error { constructor(public status: number,message: string) { super(message); } }
export const uuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export async function developerActor(request: Request,scope: string) {
  const admin = createAdminClient();
  const authorization = request.headers.get("authorization");
  let ownerId: string | undefined, scopes: readonly string[] = DEVELOPER_SCOPES;
  if (authorization) {
    const key = authorization.match(/^Bearer (gg_[A-Za-z0-9_-]{43})$/)?.[1];
    if (!key) throw new ApiError(401,"A valid GiftGrid API key is required.");
    const hash = createHash("sha256").update(key).digest("hex");
    const { data, error } = await admin.from("developer_api_keys").select("owner_id,scopes,expires_at,revoked_at").eq("key_hash",hash).maybeSingle();
    if (error) throw new ApiError(503,"API authentication is temporarily unavailable.");
    if (!data || data.revoked_at || Date.parse(data.expires_at) <= Date.now()) throw new ApiError(401,"The API key is invalid, expired, or revoked.");
    ownerId = data.owner_id; scopes = data.scopes;
  } else {
    const { data: { user } } = await (await createClient()).auth.getUser();
    ownerId = user?.id;
  }
  if (!ownerId) throw new ApiError(401,"Sign in or provide a GiftGrid API key.");
  if (!scopes.includes(scope)) throw new ApiError(403,`This action requires the ${scope} scope.`);
  const { data: profile, error } = await admin.from("profiles").select("is_active").eq("id",ownerId).single();
  if (error || !profile || profile.is_active === false) throw new ApiError(403,"This account cannot access the developer API.");
  return { ownerId,scopes,admin };
}
export async function ownedApp(actor: Awaited<ReturnType<typeof developerActor>>,id: string) {
  if (!uuid(id)) throw new ApiError(400,"Invalid app ID.");
  const { data,error } = await actor.admin.from("developer_apps").select("id,name").eq("id",id).eq("owner_id",actor.ownerId).maybeSingle();
  if (error) throw new ApiError(503,"Unable to access this app.");
  if (!data) throw new ApiError(404,"App not found.");
  return data;
}
export async function jsonInput(request: Request) {
  if (Number(request.headers.get("content-length")) > 16384) throw new ApiError(413,"Request is too large.");
  const text = await request.text();
  if (text.length > 16384) throw new ApiError(413,"Request is too large.");
  try { const value: unknown = JSON.parse(text); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); return value as Record<string,unknown>; }
  catch { throw new ApiError(400,"Provide a JSON object."); }
}
export function apiFailure(error: unknown) {
  return NextResponse.json({ error: error instanceof ApiError ? error.message : "The API request could not be completed.", requestId: crypto.randomUUID() }, { status: error instanceof ApiError ? error.status : 500, headers: { "Cache-Control":"no-store" } });
}
export const newApiKey = () => "gg_" + randomBytes(32).toString("base64url");
export const hashApiKey = (key: string) => createHash("sha256").update(key).digest("hex");
