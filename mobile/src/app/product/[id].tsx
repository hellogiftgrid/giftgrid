import React from 'react';
import { Text, Share } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { api, asset, origin } from '../../client';
import { Page, Picture, Status, Button, styles, useLoad } from '../../ui';
export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useLoad(() => api('/shop/' + encodeURIComponent(id)), [id]);
  const product = load.data?.product;
  return <Page title={product?.title || 'Product'} loading={load.loading} refresh={load.refresh}><Button title="Back to Market" onPress={() => router.canGoBack() ? router.back() : router.replace('/market')} /><Status {...load} />{product && <><Picture uri={asset(product.hero_image_url)} /><Text style={styles.text}>{product.description || product.short_description}</Text><Text style={styles.text}>{product.price_range || 'Confirm pricing with the seller'}</Text><Text style={styles.muted}>Minimum order: {product.minimum_order_quantity ?? 'Confirm with seller'}</Text><Text style={styles.muted}>{product.supplier ? `${product.supplier.source} · ${product.supplier.name}. Confirm current stock and terms at the source.` : product.merchant_profiles?.business_name}</Text><Button title={product.supplier ? `Visit ${product.supplier.source}` : 'Open product enquiry'} onPress={() => { void Linking.openURL(product.supplier?.url || `${origin}/market/${id}`); }} /><Button title="Share product" onPress={() => { void Share.share({ message: `${origin}/market/${id}` }); }} /></>}</Page>;
}
