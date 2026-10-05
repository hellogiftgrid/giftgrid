import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'node:crypto';
import sharp from 'sharp';

const write = process.argv.includes('--write');
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const demos = [
  ['studio-one', 'Demo Studio One', 'merchant', 'Packaging and presentation', 'Demonstration only: imagine a welcome kit with a notebook, reusable cup and a simple message card. Which packaging details would you want to confirm before requesting a quotation? This is a sample discussion, not an available product offer.'],
  ['studio-two', 'Demo Studio Two', 'merchant', 'Product customisation', 'Demonstration only: a hypothetical branded notebook project needs a logo file, print position, quantity and proof approval. What would you include in your artwork brief? No stock or order is offered by this demo account.'],
  ['studio-three', 'Demo Studio Three', 'merchant', 'Small-batch gifting', 'Demonstration only: compare a plain gift box with a reusable pouch for a sample employee appreciation project. What matters most to your recipients: presentation, practical reuse or compact delivery? This is a learning example.'],
  ['buyer-avery', 'Demo Buyer Avery', 'buyer', 'Employee onboarding', 'Demo sourcing brief: imagine welcoming 40 new colleagues across two offices. We would ask merchants about useful desk items, packaging, minimum quantity and an agreed arrival date. What important question is missing from this fictional brief?'],
  ['buyer-jordan', 'Demo Buyer Jordan', 'buyer', 'Event gifts', 'Demo sourcing brief: a fictional conference needs 100 easy-to-carry gifts. We would compare packed size, sample quality and venue delivery windows. How would you organise the shortlist? This is not a live purchasing request.'],
  ['buyer-morgan', 'Demo Buyer Morgan', 'buyer', 'Client appreciation', 'Demo discussion: for a hypothetical client thank-you project, would you start with a useful item, a personal message or presentation? Explain your reasoning. This account represents an example workflow, not a real customer.'],
  ['buyer-riley', 'Demo Buyer Riley', 'buyer', 'Remote team gifting', 'Demo sourcing brief: imagine sending gifts to a remote team in three regions. We would check destination coverage before choosing products and keep recipient addresses private. What would you clarify with each merchant? This is a fictional exercise.'],
  ['buyer-casey', 'Demo Buyer Casey', 'buyer', 'Recognition gifts', 'Demo discussion: a fictional recognition project needs a thoughtful item and accurately printed names. We would agree the proof and check every spelling before production. What would your final approval checklist contain?'],
  ['buyer-sam', 'Demo Buyer Sam', 'buyer', 'Seasonal planning', 'Demo sourcing brief: imagine a seasonal project that needs early sample approval and a clear delivery margin. We would separate production time from shipping time in every quotation. What would you confirm first? No actual order is being placed.'],
  ['buyer-taylor', 'Demo Buyer Taylor', 'buyer', 'Gift comparisons', 'Demo discussion: three hypothetical gift proposals include different packaging and delivery assumptions. We would compare the same quantity, currency and specification before deciding. Which overlooked cost or detail would you check?'],
];
if (!write) { console.log(JSON.stringify({ dryRun: true, demoAccounts: 10, merchantAccounts: 3, buyerAccounts: 7, posts: 10, scope: 'Labelled demo profiles, avatars, posts and interactions between demo accounts only. No real members receive messages.' })); process.exit(0); }
const check = result => { if (result.error) throw new Error(result.error.message); return result.data; };
const stableId = key => { const h = createHash('sha256').update('giftgrid-demo-v1:' + key).digest('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`; };
const existing = new Map();
for (let page = 1; ; page++) {
  const result = await admin.auth.admin.listUsers({ page, perPage: 200 }); check(result);
  for (const user of result.data.users) if (user.email?.endsWith('@giftgrid-demo.invalid')) existing.set(user.email, user);
  if (result.data.users.length < 200) break;
}
const actors = [];
const palette = ['#2563eb', '#0f766e', '#9333ea', '#b45309', '#be185d', '#0369a1', '#4f46e5', '#15803d', '#a21caf', '#c2410c'];
for (const [index, [key, name, kind, focus, body]] of demos.entries()) {
  const email = `${key}@giftgrid-demo.invalid`;
  let user = existing.get(email);
  if (!user) user = check(await admin.auth.admin.createUser({ email, password: 'Gg!9' + randomBytes(40).toString('base64url'), email_confirm: true, user_metadata: { full_name: name, business_name: name, company_name: name, account_type: kind === 'merchant' ? 'merchant' : 'corporate_buyer', giftgrid_demo: true } })).user;
  if (!user.user_metadata?.giftgrid_demo) throw new Error('Refusing to alter a non-demo account.');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="64" fill="${palette[index]}"/><circle cx="211" cy="32" r="72" fill="white" opacity=".09"/><path d="M44 221c0-56 38-87 84-87s84 31 84 87" fill="#e2e8f0"/><circle cx="128" cy="97" r="48" fill="#f1c5a5"/><path d="M80 91c-3-64 102-68 98 1-21-4-39-18-48-30-12 17-28 25-50 29" fill="#172033"/><circle cx="111" cy="99" r="4" fill="#172033"/><circle cx="146" cy="99" r="4" fill="#172033"/><path d="M113 120q15 11 30 0" fill="none" stroke="#854d3c" stroke-width="4" stroke-linecap="round"/><rect x="67" y="216" width="122" height="29" rx="14" fill="#0f172a"/><text x="128" y="236" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="white">DEMO ${index + 1}</text></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const imagePath = `${user.id}/demo-avatar-v1.png`;
  check(await admin.storage.from('community-media').upload(imagePath, png, { contentType: 'image/png', upsert: true }));
  const avatar = admin.storage.from('community-media').getPublicUrl(imagePath).data.publicUrl;
  check(await admin.from('profiles').update({ full_name: name }).eq('id', user.id));
  check(await admin.from('community_member_profiles').upsert({ profile_id: user.id, display_name: name, kind, bio: `GiftGrid demonstration account for ${focus.toLowerCase()}. Fictional sample activity, not a real customer or merchant. No products or purchasing commitments are offered.`, avatar_url: avatar, is_listed: true }, { onConflict: 'profile_id' }));
  const postId = stableId(`post:${key}`);
  check(await admin.from('community_posts').upsert({ id: postId, author_id: user.id, author_name: name, topic: 'Demo', body, status: 'published', system_key: `demo:v1:${key}` }, { onConflict: 'id', ignoreDuplicates: true }));
  actors.push({ id: user.id, postId, name, key, kind });
  console.log(`Ready: ${name}`);
}
for (const actor of actors) {
  for (const post of actors) if (post.id !== actor.id) check(await admin.from('community_likes').upsert({ post_id: post.postId, member_id: actor.id }, { onConflict: 'post_id,member_id', ignoreDuplicates: true }));
}
for (const [i, buyer] of actors.slice(3).entries()) {
  const merchant = actors[i % 3];
  check(await admin.from('community_follows').upsert({ follower_id: buyer.id, followed_id: merchant.id }, { onConflict: 'follower_id,followed_id', ignoreDuplicates: true }));
  const comments = [
    { id: stableId(`comment:buyer:${buyer.key}`), post_id: merchant.postId, author_id: buyer.id, author_name: buyer.name, body: 'Demo reply: I would confirm the exact specification, sample and delivery assumptions before comparing quotations. This is a fictional example, not a purchasing commitment.' },
    { id: stableId(`comment:merchant:${buyer.key}`), post_id: buyer.postId, author_id: merchant.id, author_name: merchant.name, body: 'Demo merchant reply: a useful next step would be to confirm quantity, destination, artwork and the required arrival date. This account demonstrates the conversation only; it is not offering real stock.' },
  ];
  check(await admin.from('community_comments').upsert(comments, { onConflict: 'id', ignoreDuplicates: true }));
  const connectionId = stableId(`chat:${buyer.key}`);
  check(await admin.from('community_connections').upsert({ id: connectionId, requester_id: buyer.id, recipient_id: merchant.id, status: 'accepted' }, { onConflict: 'id', ignoreDuplicates: true }));
  check(await admin.from('community_connection_messages').upsert([
    { id: stableId(`message:buyer:${buyer.key}`), connection_id: connectionId, sender_id: buyer.id, body: 'DEMO CONVERSATION: This sample illustrates a private sourcing enquiry. For a fictional project, could you explain what details a complete quotation would need?' },
    { id: stableId(`message:merchant:${buyer.key}`), connection_id: connectionId, sender_id: merchant.id, body: 'DEMO RESPONSE: We would ask about the item, quantity, destination, deadline, branding and packaging. These are illustrative messages between demo accounts, not a live offer or order.' },
  ], { onConflict: 'id', ignoreDuplicates: true }));
}
console.log(JSON.stringify({ complete: true, demoAccounts: 10, posts: 10, demoLikes: 90, comments: 14, privateDemoConversations: 7, realMembersMessaged: 0 }));
