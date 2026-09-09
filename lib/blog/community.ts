import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogArticle } from "./types";

const COMMUNITY_URL = "https://www.degiftgrid.com/blog";

/** Publish a journal announcement to the live community feed exactly once. */
export async function publishArticleToCommunity(article: BlogArticle) {
  const db = createAdminClient();
  const body = `${article.title}\n\n${article.excerpt}\n\nRead the full guide: ${COMMUNITY_URL}/${article.slug}`.slice(0, 2000);
  const { error } = await db.from("community_posts").upsert(
    {
      author_id: null,
      author_name: "GiftGrid",
      topic: article.category.slice(0, 40) || "Journal",
      body,
      system_key: `blog-${article.slug}`,
      status: "published",
    },
    { onConflict: "system_key" },
  );

  if (error) throw new Error("Could not publish the article to the community.");
  return { status: "published", key: `blog-${article.slug}` };
}
