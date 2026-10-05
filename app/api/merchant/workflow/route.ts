import { NextResponse } from "next/server";
import { memberContext } from "@/lib/community/members";
import { ApiError, apiFailure, jsonInput, uuid } from "@/lib/developer/api";
async function context() {
 const { supabase, user, admin } = await memberContext();
 const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
 if (profile?.role !== "merchant") throw new ApiError(403, "Merchant workflows require a merchant account.");
 const { data: merchant, error } = await supabase.from("merchant_profiles").select("id").eq("user_id", user.id).single();
 if (error || !merchant) throw new ApiError(404, "Merchant profile not found.");
 return { admin, merchant };
}
export async function GET() {
 try {
  const { admin, merchant } = await context();
  const { error } = await admin.rpc("sync_merchant_workflow", { target_merchant: merchant.id });
  if (error) throw new ApiError(503, "Unable to refresh workflow tasks.");
  const [tasks, preferences] = await Promise.all([
   admin.from("merchant_workflow_tasks").select("id,title,detail,href,status,created_at").eq("merchant_id", merchant.id).eq("resolved", false).order("created_at", { ascending: false }),
   admin.from("merchant_workflow_preferences").select("enabled").eq("merchant_id", merchant.id).maybeSingle()
  ]);
  if (tasks.error || preferences.error) throw new ApiError(503, "Unable to load your workflow.");
  return NextResponse.json({ tasks: tasks.data, enabled: preferences.data?.enabled ?? true }, { headers: { "Cache-Control": "private, no-store" } });
 } catch (error) { return apiFailure(error); }
}
export async function PATCH(request: Request) {
 try {
  const { admin, merchant } = await context(), input = await jsonInput(request);
  if (typeof input.enabled === "boolean") {
   const { error } = await admin.from("merchant_workflow_preferences").upsert({ merchant_id: merchant.id, enabled: input.enabled });
   if (error) throw new ApiError(503, "Unable to save automation settings.");
   if (input.enabled) { const { error: syncError } = await admin.rpc("sync_merchant_workflow", { target_merchant: merchant.id }); if (syncError) throw new ApiError(503, "Settings saved, but task refresh failed. Please retry."); }
  } else {
   if (typeof input.id !== "string" || !uuid(input.id) || !["todo", "in_progress", "done"].includes(String(input.status))) throw new ApiError(400, "Choose a task and a valid status.");
   const { data, error } = await admin.from("merchant_workflow_tasks").update({ status: input.status, updated_at: new Date().toISOString() }).eq("id", input.id).eq("merchant_id", merchant.id).select("id").maybeSingle();
   if (error) throw new ApiError(503, "Unable to update this task.");
   if (!data) throw new ApiError(404, "Task not found.");
  }
  return NextResponse.json({ saved: true });
 } catch (error) { return apiFailure(error); }
}
