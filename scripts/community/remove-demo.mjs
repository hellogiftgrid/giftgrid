import { createClient } from "@supabase/supabase-js";

const execute = process.argv.includes("--execute");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set the Supabase URL and service-role key in the environment.");
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const check = result => { if (result.error) throw new Error(result.error.message); return result.data; };

const users = [];
for (let page = 1; ; page++) {
  const result = check(await admin.auth.admin.listUsers({ page, perPage: 200 }));
  users.push(...result.users.filter(user => user.email?.toLowerCase().endsWith("@giftgrid-demo.invalid") && user.user_metadata?.giftgrid_demo === true));
  if (result.users.length < 200) break;
}
const ids = users.map(user => user.id);
const posts = ids.length ? check(await admin.from("community_posts").select("id").in("author_id", ids)) : [];
const postIds = [...new Set(posts.map(post => post.id))];
const fromConnections = ids.length ? check(await admin.from("community_connections").select("id").in("requester_id", ids)) : [];
const toConnections = ids.length ? check(await admin.from("community_connections").select("id").in("recipient_id", ids)) : [];
const connectionIds = [...new Set([...fromConnections, ...toConnections].map(connection => connection.id))];

console.log(JSON.stringify({ dryRun: !execute, demoUsers: users.map(user => ({ email: user.email, id: user.id })), demoPosts: postIds.length, demoConversations: connectionIds.length, predicate: "Both giftgrid_demo=true and @giftgrid-demo.invalid are required." }, null, 2));
if (!execute || !ids.length) process.exit(0);

if (connectionIds.length) {
  check(await admin.from("community_connection_messages").delete().in("connection_id", connectionIds));
  check(await admin.from("community_connections").delete().in("id", connectionIds));
}
if (ids.length) {
  check(await admin.from("community_comments").delete().in("author_id", ids));
  check(await admin.from("community_likes").delete().in("member_id", ids));
  check(await admin.from("community_follows").delete().in("follower_id", ids));
  check(await admin.from("community_follows").delete().in("followed_id", ids));
}
if (postIds.length) {
  check(await admin.from("community_comments").delete().in("post_id", postIds));
  check(await admin.from("community_likes").delete().in("post_id", postIds));
}
if (ids.length) check(await admin.from("community_posts").delete().in("author_id", ids));
if (postIds.length) check(await admin.from("community_posts").delete().in("id", postIds));
if (ids.length) check(await admin.from("community_member_profiles").delete().in("profile_id", ids));

for (const user of users) {
  await admin.storage.from("community-media").remove([`${user.id}/demo-avatar-v1.png`]);
  check(await admin.auth.admin.deleteUser(user.id));
}
console.log(JSON.stringify({ complete: true, removedDemoUsers: users.length, removedDemoPosts: postIds.length, removedDemoConversations: connectionIds.length }));
