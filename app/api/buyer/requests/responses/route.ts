import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiError, apiFailure, jsonInput, uuid } from '@/lib/developer/api';

const marker = (id: string) => `[GGREQ:${id}]`;

export async function POST(request: Request) {
  try {
    const client = await createClient(), { data: { user } } = await client.auth.getUser();
    if (!user) throw new ApiError(401, 'Sign in as an approved merchant to respond.');
    const input = await jsonInput(request);
    const requestId = typeof input.requestId === 'string' ? input.requestId : '';
    const productId = typeof input.productId === 'string' ? input.productId : '';
    const price = typeof input.price === 'string' ? input.price.trim() : '';
    const leadTime = typeof input.leadTime === 'string' ? input.leadTime.trim() : '';
    const message = typeof input.message === 'string' ? input.message.trim() : '';
    if (!uuid(requestId) || !uuid(productId) || price.length < 1 || price.length > 120 || leadTime.length < 2 || leadTime.length > 120 || message.length > 1500) throw new ApiError(400, 'Attach a product and provide your price and lead time.');

    const admin = createAdminClient();
    const [merchant, profile] = await Promise.all([
      admin.from('merchant_profiles').select('id,user_id,business_name').eq('user_id', user.id).maybeSingle(),
      admin.from('profiles').select('role,is_active').eq('id', user.id).maybeSingle(),
    ]);
    if (merchant.error || profile.error) throw new ApiError(503, 'Unable to verify merchant access.');
    if (profile.data?.role !== 'merchant' || profile.data.is_active === false || !merchant.data) throw new ApiError(403, 'An active merchant account is required to respond.');

    const [post, privateBrief, listing] = await Promise.all([
      admin.from('community_posts').select('id').eq('system_key', `buyer-request:${requestId}`).eq('status', 'published').maybeSingle(),
      admin.from('community_posts').select('author_id,body').eq('system_key', `buyer-request-private:${requestId}`).eq('status', 'hidden').maybeSingle(),
      admin.from('shop_visible_listings').select('id,title,merchant_id,minimum_order_quantity,price_range,lead_time').eq('id', productId).eq('merchant_id', merchant.data.id).maybeSingle(),
    ]);
    if (post.error || privateBrief.error) throw new ApiError(503, 'Unable to load the private buyer brief.');
    if (!post.data || !privateBrief.data) throw new ApiError(404, 'This buyer request is no longer open.');
    if (listing.error || !listing.data) throw new ApiError(403, 'Choose one of your eligible, published products.');

    const subjectPrefix = marker(requestId);
    let candidate = await admin.from('buyer_inquiries').select('id,buyer_id,status').eq('merchant_id', merchant.data.id).like('subject', `${subjectPrefix}%`).in('status', ['sent', 'viewed', 'accepted']).limit(1).maybeSingle();
    if (candidate.error) throw new ApiError(503, 'Unable to load the private buyer brief.');
    if (!candidate.data) {
      const fields = (() => { try { const value = JSON.parse(privateBrief.data.body); return value && typeof value === 'object' ? value as Record<string, unknown> : null; } catch { return null; } })();
      if (!fields || typeof privateBrief.data.author_id !== 'string' || typeof fields.title !== 'string') throw new ApiError(503, 'The private buyer brief is unavailable.');
      const buyer = await admin.from('buyer_profiles').select('id,status').eq('profile_id', privateBrief.data.author_id).maybeSingle();
      if (buyer.error || buyer.data?.status !== 'approved') throw new ApiError(404, 'This buyer request is no longer available.');
      candidate = await admin.from('buyer_inquiries').insert({
        buyer_id: buyer.data.id, merchant_id: merchant.data.id, subject: `${subjectPrefix} ${fields.title}`.slice(0, 160),
        message: privateBrief.data.body, quantity: fields.quantity, target_date: fields.neededBy, budget: fields.budget, status: 'sent',
      }).select('id,buyer_id,status').single();
      if (candidate.error || !candidate.data) throw new ApiError(503, 'Unable to prepare your private response. Please retry.');
    }

    const body = JSON.stringify({ type: 'request_response', inquiryId: candidate.data.id, requestId, productId, productTitle: listing.data.title, merchantId: merchant.data.id, businessName: merchant.data.business_name, price, minimumOrderQuantity: listing.data.minimum_order_quantity, leadTime, message, createdAt: new Date().toISOString() });
    const previous = await admin.from('connection_messages').select('id').eq('inquiry_id', candidate.data.id).eq('sender_id', user.id).like('body', '%"type":"request_response"%').maybeSingle();
    if (previous.error) throw new ApiError(503, 'Unable to check your previous response.');
    const saved = previous.data
      ? await admin.from('connection_messages').update({ body }).eq('id', previous.data.id).select('id').single()
      : await admin.from('connection_messages').insert({ inquiry_id: candidate.data.id, sender_id: user.id, body }).select('id').single();
    if (saved.error) throw new ApiError(503, 'Unable to send your response.');
    await admin.from('buyer_inquiries').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', candidate.data.id);
    return NextResponse.json({ sent: true });
  } catch (error) { return apiFailure(error); }
}
