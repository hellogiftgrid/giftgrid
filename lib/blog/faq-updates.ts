import { createAdminClient } from "@/lib/supabase/admin";

const updates = [
  ["What is GiftGrid?", "GiftGrid helps ecommerce brands prepare their public storefronts and commercial information for corporate gifting and other buyer conversations. Merchants can review recommendations, organize useful documents, and keep conversations in one place."],
  ["Who can join GiftGrid?", "Any ecommerce brand with a live, publicly accessible store can apply. The store does not need to be perfect. GiftGrid uses the review to identify practical improvements and clarify the next step."],
  ["What does a store review cover?", "A review looks at public signals such as technical health, mobile experience, navigation, SEO, accessibility, and product presentation. Findings that need human judgment are treated as manual review items."],
  ["How should I prepare for a buyer conversation?", "Bring a clear product range, realistic quantities, lead times, packaging information, customization boundaries, and the questions you still need answered. Specific information makes the conversation more useful."],
  ["Can I ask for development help?", "Yes. If a review identifies a practical improvement, you can discuss the issue with GiftGrid and ask about an appropriate developer introduction. The required work and timing should be agreed before anything begins."],
];

export async function publishDailyFaqUpdate() {
  const index = Math.floor(Date.now() / 86400000) % updates.length;
  const [question, answer] = updates[index];
  const key = `faq-daily-${new Date().toISOString().slice(0, 10)}`;
  const db = createAdminClient();
  const { error } = await db.from("community_posts").upsert({ author_id: null, author_name: "GiftGrid", topic: "FAQ", body: `${question}\n\n${answer}`, system_key: key, status: "published" }, { onConflict: "system_key" });
  if (error) throw new Error("Could not publish the daily FAQ update.");
  return { status: "published", key, question };
}
