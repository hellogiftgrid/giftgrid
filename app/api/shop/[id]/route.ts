import { NextResponse } from 'next/server';
import { getShopProduct } from '@/lib/shop/catalog';
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const product = await getShopProduct((await context.params).id);
    return product ? NextResponse.json({ product }, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  } catch { return NextResponse.json({ error: 'Unable to load this product.' }, { status: 503 }); }
}
