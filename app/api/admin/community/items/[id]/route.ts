import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const failure = (status: number, error: string) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return failure(401, "Sign in as a super admin to moderate posts.");
    const admin = createAdminClient();
    const profile = await admin.from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
    if (profile.error) return failure(503, "Unable to verify admin access.");
    if (profile.data?.role !== "super_admin" || profile.data.is_active === false) return failure(403, "Only an active super admin can delete posts.");
    const { id } = await context.params;
    if (!validId(id)) return failure(400, "Invalid post or request ID.");
    let input: Record<string, unknown>;
    try {
      const value: unknown = await request.json();
      if (!value || typeof value !== "object" || Array.isArray(value)) return failure(400, "Provide the item type.");
      input = value as Record<string, unknown>;
    } catch { return failure(400, "Provide the item type."); }
    const kind = input.kind;
    if (kind !== "community_post" && kind !== "sourcing_request") return failure(400, "Choose a community post or sourcing request.");

    if (kind === "community_post") {
      const post = await admin.from("community_posts").select("id,system_key").eq("id", id).maybeSingle();
      if (post.error) return failure(503, "Unable to check this community post.");
      if (!post.data || post.data.system_key?.startsWith("buyer-request:") || post.data.system_key?.startsWith("buyer-request-private:")) {
        return failure(404, "Community post not found. Sourcing requests are managed separately.");
      }
      const result = await admin.from("community_posts").delete().eq("id", id);
      if (result.error) return failure(503, "Unable to delete this community post.");
      return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
    }

    const publicKey = `buyer-request:${id}`;
    const privateKey = `buyer-request-private:${id}`;
    const publicPost = await admin.from("community_posts").select("id").eq("system_key", publicKey).maybeSingle();
    if (publicPost.error) return failure(503, "Unable to check this sourcing request.");
    if (!publicPost.data) return failure(404, "Sourcing request not found.");

    const inquiries = await admin.from("buyer_inquiries").select("id").like("subject", `[GGREQ:${id}]%`);
    if (inquiries.error) return failure(503, "Unable to load replies for this sourcing request.");
    const inquiryIds = (inquiries.data || []).map(row => row.id);
    if (inquiryIds.length) {
      const replies = await admin.from("connection_messages").delete().in("inquiry_id", inquiryIds);
      if (replies.error) return failure(503, "Unable to remove merchant replies. The sourcing request is still available.");
      const removedInquiries = await admin.from("buyer_inquiries").delete().in("id", inquiryIds);
      if (removedInquiries.error) return failure(503, "Unable to remove quote records. The sourcing request may still be available.");
    }

    const privatePost = await admin.from("community_posts").delete().eq("system_key", privateKey);
    if (privatePost.error) return failure(503, "Unable to remove the private sourcing brief.");
    const removedPublic = await admin.from("community_posts").delete().eq("id", publicPost.data.id);
    if (removedPublic.error) return failure(503, "The replies were cleared, but the public sourcing request could not be removed. Retry the action.");
    return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin community moderation failed:", error);
    return failure(500, "Could not delete this item.");
  }
}
