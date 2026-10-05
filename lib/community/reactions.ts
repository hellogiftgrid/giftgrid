import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getPostStats(ids: string[], viewer: string | null) {
  if (!ids.length) return [];
  const { data, error } = await createAdminClient().rpc("community_post_stats", { post_ids: ids, viewer });
  if (error) throw new Error("Unable to load community actions.");
  return data as { post_id: string; like_count: number; comment_count: number; liked: boolean }[];
}
