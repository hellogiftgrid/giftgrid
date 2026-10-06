import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiError, apiFailure, jsonInput, uuid } from '@/lib/developer/api';

const marker = (id: string) => `[GGREQ:${id}]`;
const privateKey = (id: string) => `buyer-request-private:${id}`;
const publicTeaser = 'A GiftGrid buyer has shared an open gifting request. Sign in as a merchant to read the full brief. Buyer contact details are not shown.';

function brief(input: Record<string, unknown>) {
  const get = (key: string, max: number) => typeof input[key] === 'string' ? input[key].trim().slice(0, max) : '';
  const title = get('title', 140), category = get('category', 64), deliveryRegion = get('deliveryRegion', 120), customization = get('customization', 80), details = get('details', 1200);
  const quantity = Number(input.quantity), budgetMin = Number(input.budgetMin), budgetMax = Number(input.budgetMax), currency = get('currency', 3).toUpperCase(), neededBy = get('neededBy', 10);
  if (title.length < 4 || !['Gifts', 'Journals & Planners', 'Apparel', 'Wholesale', 'Other'].includes(category) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000000 || !deliveryRegion || !customization || details.length < 12 || !['none', 'logo', 'packaging', 'personalization', 'multiple'].includes(customization)) {
    throw new ApiError(400, 'Complete the title, category, quantity, delivery region, customization, and details.');
  }
  if (details.length > 1000) throw new ApiError(400, 'Keep request details under 1,000 characters.');
  if (!/^[A-Z]{3}$/.test(currency) || !Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin <= 0 || budgetMax < budgetMin || budgetMax > 10000000) throw new ApiError(400, 'Enter a valid per-unit budget range and three-letter currency.');
  const parsedDate = new Date(neededBy + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(neededBy) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== neededBy || neededBy < new Date().toISOString().slice(0, 10)) throw new ApiError(400, 'Choose a valid upcoming delivery date.');
  if (/[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(details) || /(?:\+?\d[\d ().-]{7,}\d)/.test(details)) throw new ApiError(400, 'Leave personal email addresses and phone numbers out of the request. Merchants do not receive your contact information.');
  return { title, category, quantity, deliveryRegion, customization, details, neededBy, currency, budget: `${currency} ${budgetMin.toFixed(2)} to ${currency} ${budgetMax.toFixed(2)} per unit` };
}

function parseObject(value: string): Record<string, unknown> | null {
  try { const parsed: unknown = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null; }
  catch { return null; }
}

function requestIdFromSubject(value: string) { return value.match(/^\[GGREQ:([0-9a-f-]{36})\]/i)?.[1] || null; }
function briefFromInquiry(id: string, row: { subject: string; message: string; quantity: number; target_date: string; budget: string; created_at: string }) {
  const fields = parseObject(row.message);
  if (!fields) return null;
  return { ...fields, id, title: row.subject.replace(/^\[GGREQ:[0-9a-f-]{36}\]\s*/i, ''), quantity: row.quantity, budget: row.budget, neededBy: row.target_date, created_at: row.created_at };
}

async function merchantAccess(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const [profile, merchant] = await Promise.all([
    admin.from('profiles').select('role,is_active').eq('id', userId).maybeSingle(),
    admin.from('merchant_profiles').select('id,business_name,user_id,application_status').eq('user_id', userId).maybeSingle(),
  ]);
  if (profile.error || merchant.error) throw new ApiError(503, 'Unable to check merchant access.');
  if (profile.data?.role !== 'merchant' || profile.data.is_active === false || !merchant.data) return null;
  const canRespond = true;
  return { ...merchant.data, canRespond };
}

export async function GET() {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    const admin = createAdminClient();
    const { data: posts, error } = await admin.from('community_posts')
      .select('id,system_key,created_at,status').like('system_key', 'buyer-request:%')
      .eq('status', 'published').order('created_at', { ascending: false }).limit(200);
    if (error) throw new ApiError(503, 'Unable to load buyer requests.');
    const open = (posts || []).filter(p => typeof p.system_key === 'string' && /^buyer-request:[0-9a-f-]{36}$/i.test(p.system_key));
    const teasers = open.map(p => ({ id: p.system_key.slice(14), title: 'Open gifting request', created_at: p.created_at, teaser: publicTeaser }));
    const buildOpen = async () => {
      const ids = open.map(p => p.system_key.slice(14));
      if (!ids.length) return [];
      const [privatePosts, oldInquiries] = await Promise.all([
        admin.from('community_posts').select('system_key,body,created_at').eq('status', 'hidden').in('system_key', ids.map(privateKey)),
        admin.from('buyer_inquiries').select('id,buyer_id,merchant_id,subject,message,quantity,target_date,budget,status,created_at').in('status', ['sent', 'viewed', 'accepted']).like('subject', '[GGREQ:%').order('created_at', { ascending: false }).limit(5000),
      ]);
      const openIds = new Set(ids), briefs = new Map<string, Record<string, unknown>>();
      for (const row of privatePosts.data || []) {
        const id = typeof row.system_key === 'string' ? row.system_key.slice('buyer-request-private:'.length) : '';
        const fields = parseObject(row.body);
        if (openIds.has(id) && fields) briefs.set(id, { ...fields, id, created_at: row.created_at });
      }
      for (const row of oldInquiries.data || []) {
        const id = requestIdFromSubject(row.subject);
        if (!id || !openIds.has(id) || briefs.has(id)) continue;
        const item = briefFromInquiry(id, row);
        if (item) briefs.set(id, item);
      }
      return ids.flatMap(id => (briefs.has(id) ? [briefs.get(id)] : []));
    };
    if (!user) return NextResponse.json({ requests: await buildOpen(), verified: false, canRespond: false, approved: false, canPost: false, role: null }, { headers: { 'Cache-Control': 'no-store' } });

    const merchant = await merchantAccess(admin, user.id);
    if (merchant) {
      const ids = open.map(p => p.system_key.slice(14));
      if (!ids.length) return NextResponse.json({ requests: [], products: [], verified: merchant.canRespond, canRespond: merchant.canRespond, approved: false, canPost: false, role: 'merchant' }, { headers: { 'Cache-Control': 'private, no-store' } });
      const [privatePosts, oldInquiries, products] = await Promise.all([
        admin.from('community_posts').select('system_key,body,created_at').eq('status', 'hidden').in('system_key', ids.map(privateKey)),
        admin.from('buyer_inquiries').select('id,buyer_id,merchant_id,subject,message,quantity,target_date,budget,status,created_at').in('status', ['sent', 'viewed', 'accepted']).like('subject', '[GGREQ:%').order('created_at', { ascending: false }).limit(5000),
        merchant.canRespond ? admin.from('shop_visible_listings').select('id,title,minimum_order_quantity,price_range,lead_time').eq('merchant_id', merchant.id).order('created_at', { ascending: false }).limit(100) : Promise.resolve({ data: [], error: null }),
      ]);
      if (privatePosts.error || oldInquiries.error || products.error) throw new ApiError(503, 'Unable to load private buyer briefs.');
      const openIds = new Set(ids), briefs = new Map<string, Record<string, unknown>>();
      for (const row of privatePosts.data || []) {
        const id = typeof row.system_key === 'string' ? row.system_key.slice('buyer-request-private:'.length) : '';
        const fields = parseObject(row.body);
        if (openIds.has(id) && fields) briefs.set(id, { ...fields, id, created_at: row.created_at });
      }
      for (const row of oldInquiries.data || []) {
        const id = requestIdFromSubject(row.subject);
        if (!id || !openIds.has(id) || briefs.has(id)) continue;
        const item = briefFromInquiry(id, row);
        if (item) briefs.set(id, item);
      }
      const requests = ids.flatMap(id => {
        const item = briefs.get(id);
        return item ? [{ ...item, inquiryId: (oldInquiries.data || []).find(r => r.merchant_id === merchant.id && requestIdFromSubject(r.subject) === id)?.id }] : [];
      });
      return NextResponse.json({ requests, products: products.data || [], verified: merchant.canRespond, canRespond: merchant.canRespond, approved: false, canPost: false, role: 'merchant' }, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    const profile = await admin.from('profiles').select('role,is_active').eq('id', user.id).maybeSingle();
    if (profile.error) throw new ApiError(503, 'Unable to verify your account.');
    const buyer = await admin.from('buyer_profiles').select('id,status').eq('profile_id', user.id).maybeSingle();
    if (buyer.error) throw new ApiError(503, 'Unable to load buyer requests.');
    if (profile.data?.role !== 'corporate_buyer' || profile.data.is_active === false || !buyer.data) return NextResponse.json({ requests: await buildOpen(), verified: false, canRespond: false, approved: false, canPost: false, role: profile.data?.role || null }, { headers: { 'Cache-Control': 'private, no-store' } });
    if (buyer.data.status !== 'approved') return NextResponse.json({ requests: await buildOpen(), verified: false, canRespond: false, approved: false, canPost: false, role: 'corporate_buyer' }, { headers: { 'Cache-Control': 'private, no-store' } });

    const [inquiries, privateRows] = await Promise.all([
      admin.from('buyer_inquiries').select('id,buyer_id,subject,message,quantity,target_date,budget,status,created_at,merchant_profiles(business_name)').eq('buyer_id', buyer.data.id).like('subject', '[GGREQ:%').order('created_at', { ascending: false }).limit(2000),
      admin.from('community_posts').select('system_key,body,created_at').eq('author_id', user.id).eq('status', 'hidden').like('system_key', 'buyer-request-private:%').order('created_at', { ascending: false }).limit(200),
    ]);
    if (inquiries.error || privateRows.error) throw new ApiError(503, 'Unable to load your requests.');
    const ids = new Set<string>();
    for (const row of inquiries.data || []) { const id = requestIdFromSubject(row.subject); if (id) ids.add(id); }
    for (const row of privateRows.data || []) { const id = typeof row.system_key === 'string' ? row.system_key.slice('buyer-request-private:'.length) : ''; if (/^[0-9a-f-]{36}$/i.test(id)) ids.add(id); }
    const idList = [...ids];
    const buyerPosts = idList.length ? await admin.from('community_posts').select('id,system_key,status').in('system_key', idList.map(id => `buyer-request:${id}`)) : { data: [], error: null };
    if (buyerPosts.error) throw new ApiError(503, 'Unable to load your public requests.');
    const published = new Set((buyerPosts.data || []).filter(p => p.status === 'published').map(p => p.system_key.slice(14)));
    const inquiryRows = (inquiries.data || []).filter(i => { const id = requestIdFromSubject(i.subject); return !!id && published.has(id); });
    const replyIds = inquiryRows.map(i => i.id);
    const replies = replyIds.length ? await admin.from('connection_messages').select('inquiry_id,sender_id,body,created_at').in('inquiry_id', replyIds).order('created_at', { ascending: true }).limit(500) : { data: [], error: null };
    if (replies.error) throw new ApiError(503, 'Unable to load merchant responses.');
    const senderIds = [...new Set((replies.data || []).map(r => r.sender_id))];
    const merchantNames = senderIds.length ? await admin.from('merchant_profiles').select('user_id,business_name').in('user_id', senderIds) : { data: [], error: null };
    if (merchantNames.error) throw new ApiError(503, 'Unable to load response names.');
    const nameById = new Map((merchantNames.data || []).map(m => [m.user_id, m.business_name]));
    const offers: Record<string, any>[] = (replies.data || []).flatMap(r => {
      const offer = parseObject(r.body);
      if (!offer || offer.type !== 'request_response' || !published.has(String(offer.requestId))) return [];
      return [{ ...offer, businessName: nameById.get(r.sender_id) || 'GiftGrid merchant', created_at: r.created_at }];
    });
    const grouped = new Map<string, Record<string, any>>();
    for (const row of privateRows.data || []) {
      const id = typeof row.system_key === 'string' ? row.system_key.slice('buyer-request-private:'.length) : '';
      if (!published.has(id)) continue;
      const fields = parseObject(row.body);
      if (fields) grouped.set(id, { ...fields, id, status: 'open', created_at: row.created_at, offers: [] });
    }
    for (const row of inquiryRows) {
      const id = requestIdFromSubject(row.subject);
      if (!id || !published.has(id)) continue;
      let item = grouped.get(id);
      if (!item) { const parsed = briefFromInquiry(id, row); if (!parsed) continue; item = { ...parsed, status: row.status, offers: [] }; grouped.set(id, item); }
      if (['sent', 'viewed'].includes(row.status)) item.status = 'open';
      else if (row.status === 'accepted' && item.status !== 'open') item.status = 'responded';
      else if (row.status === 'closed' && !['open', 'responded'].includes(item.status)) item.status = 'closed';
    }
    for (const offer of offers) grouped.get(String(offer.requestId))?.offers.push(offer);
    return NextResponse.json({ requests: [...grouped.values()], verified: false, canRespond: false, approved: true, canPost: profile.data.is_active !== false, role: 'corporate_buyer' }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiFailure(error); }
}

export async function POST(request: Request) {
  try {
    const client = await createClient(), { data: { user } } = await client.auth.getUser();
    if (!user) throw new ApiError(401, 'Sign in as an approved buyer to post a request.');
    const admin = createAdminClient(), input = await jsonInput(request), fields = brief(input);
    const [{ data: profile, error: profileError }, { data: buyer, error: buyerError }] = await Promise.all([
      admin.from('profiles').select('role,is_active,full_name').eq('id', user.id).maybeSingle(),
      admin.from('buyer_profiles').select('id,status,company_name,job_title,phone').eq('profile_id', user.id).maybeSingle(),
    ]);
    if (profileError || buyerError) throw new ApiError(503, 'Unable to verify your buyer account.');
    if (profile?.role !== 'corporate_buyer' || profile.is_active === false || !buyer || buyer.status !== 'approved') throw new ApiError(403, 'Only approved, active buyer accounts can publish open requests.');
    if (!buyer.company_name?.trim() || !buyer.job_title?.trim() || !buyer.phone?.trim()) throw new ApiError(403, 'Complete your buyer profile before posting a request.');

    const cutoff = new Date(Date.now() - 86400000).toISOString();
    const [oldInquiries, recentPrivate] = await Promise.all([
      admin.from('buyer_inquiries').select('subject').eq('buyer_id', buyer.id).like('subject', '[GGREQ:%').gte('created_at', cutoff).limit(10000),
      admin.from('community_posts').select('system_key').eq('author_id', user.id).eq('status', 'hidden').like('system_key', 'buyer-request-private:%').gte('created_at', cutoff).limit(100),
    ]);
    if (oldInquiries.error || recentPrivate.error) throw new ApiError(503, 'Unable to check request limits.');
    const recentIds = new Set<string>();
    for (const row of oldInquiries.data || []) { const id = requestIdFromSubject(row.subject); if (id) recentIds.add(id); }
    for (const row of recentPrivate.data || []) { if (typeof row.system_key === 'string') recentIds.add(row.system_key.slice('buyer-request-private:'.length)); }
    if (recentIds.size >= 5) throw new ApiError(429, 'You have reached the daily request limit. Contact GiftGrid if you need help.');

    const id = randomUUID();
    const storedBrief = { ...fields, companyName: buyer.company_name.trim().slice(0, 160) };
    const privateBody = JSON.stringify(storedBrief);
    if (privateBody.length > 2000) throw new ApiError(400, 'Shorten the request details slightly and try again.');
    const subject = `${marker(id)} ${fields.title}`.slice(0, 160);
    const privateRow = await admin.from('community_posts').insert({
      author_id: user.id, author_name: profile.full_name || 'Private buyer request', topic: 'Buyer request details',
      body: privateBody, status: 'hidden', system_key: privateKey(id),
    }).select('id').single();
    if (privateRow.error) throw new ApiError(503, 'Unable to save the private request details. Please retry.');
    const published = await admin.from('community_posts').insert({
      author_id: null, author_name: 'Anonymous', topic: 'Buyer request', body: publicTeaser,
      system_key: `buyer-request:${id}`, status: 'published',
    }).select('id,created_at').single();
    if (published.error) {
      await admin.from('community_posts').delete().eq('id', privateRow.data.id);
      throw new ApiError(503, 'The public request could not be published. Please retry.');
    }
    return NextResponse.json({ request: { id, title: fields.title, created_at: published.data.created_at, recipients: 0 } }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiFailure(error); }
}

export async function PATCH(request: Request) {
  try {
    const client = await createClient(), { data: { user } } = await client.auth.getUser();
    if (!user) throw new ApiError(401, 'Sign in to manage your request.');
    const admin = createAdminClient(), input = await jsonInput(request), id = typeof input.id === 'string' ? input.id : '';
    if (!uuid(id)) throw new ApiError(400, 'Choose a valid request.');
    const profile = await admin.from('profiles').select('role,is_active').eq('id', user.id).maybeSingle();
    const buyer = await admin.from('buyer_profiles').select('id,status').eq('profile_id', user.id).maybeSingle();
    if (profile.error || buyer.error || profile.data?.role !== 'corporate_buyer' || profile.data.is_active === false || buyer.data?.status !== 'approved') throw new ApiError(403, 'An active, approved buyer profile is required.');
    const post = await admin.from('community_posts').select('id').eq('system_key', `buyer-request:${id}`).eq('status', 'published').maybeSingle();
    if (post.error || !post.data) throw new ApiError(404, 'Open request not found.');
    const privatePost = await admin.from('community_posts').select('id').eq('system_key', privateKey(id)).eq('author_id', user.id).eq('status', 'hidden').maybeSingle();
    const oldOwnership = privatePost.data ? { data: true, error: null } : await admin.from('buyer_inquiries').select('id').eq('buyer_id', buyer.data.id).like('subject', `${marker(id)}%`).limit(1).maybeSingle().then(result => ({ data: Boolean(result.data), error: result.error }));
    if (privatePost.error || oldOwnership.error || (!privatePost.data && !oldOwnership.data)) throw new ApiError(404, 'You do not own this request.');
    const [hidePublic, hidePrivate, closeInquiries] = await Promise.all([
      admin.from('community_posts').update({ status: 'hidden', updated_at: new Date().toISOString() }).eq('id', post.data.id),
      privatePost.data ? admin.from('community_posts').update({ status: 'hidden', updated_at: new Date().toISOString() }).eq('id', privatePost.data.id) : Promise.resolve({ error: null }),
      admin.from('buyer_inquiries').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('buyer_id', buyer.data.id).like('subject', `${marker(id)}%`),
    ]);
    if (hidePublic.error || hidePrivate.error || closeInquiries.error) throw new ApiError(503, 'Unable to close the request.');
    return NextResponse.json({ closed: true });
  } catch (error) { return apiFailure(error); }
}
