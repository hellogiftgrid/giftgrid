import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { GIFTGRID_ADMIN_AVATAR, isGiftGridAdmin } from "@/config/identity";

type Author = { author_id?: string | null; author_name: string };
// Resolve roles on every read so past and future posts use the current admin identity.
export async function withAuthorAvatars<T extends Author>(posts: T[]) {
  const ids = [...new Set(posts.flatMap(post => post.author_id ? [post.author_id] : []))];
  const roles = new Map<string, string>();
  const avatars = new Map<string, string>();
  if (ids.length) {
    const admin = createAdminClient();
    const [{ data, error }, members] = await Promise.all([
      admin.from("profiles").select("id,role").in("id", ids),
      admin.from("community_member_profiles").select("profile_id,avatar_url").in("profile_id", ids),
    ]);
    if (error) throw new Error("Unable to load author profiles.");
    for (const profile of data || []) roles.set(profile.id, profile.role);
    for (const member of members.data || []) if (member.avatar_url) avatars.set(member.profile_id, member.avatar_url);
  }
  return posts.map(post => ({ ...post, author_avatar_url:
    isGiftGridAdmin(roles.get(post.author_id || "")) || (!post.author_id && post.author_name === "GiftGrid")
      ? GIFTGRID_ADMIN_AVATAR : avatars.get(post.author_id || "") || null }));
}
