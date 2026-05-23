'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ProductOffer } from '@/lib/search/adapters/types';

// ──────────────────────────────────────────────────────────
// お気に入り商品
// ──────────────────────────────────────────────────────────

/**
 * 商品のお気に入り状態を確認
 * @returns true=お気に入り済み, false=未登録, null=未ログイン/未設定
 */
export async function checkIsFavoritedProduct(
  productUrl: string
): Promise<boolean | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('favorite_products')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_url', productUrl)
    .maybeSingle();

  return data !== null;
}

/**
 * 商品をお気に入りに追加（既にあれば何もしない）
 */
export async function addFavoriteProduct(
  offer: ProductOffer
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Supabase 未設定' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '未ログイン' };

  const { error } = await supabase.from('favorite_products').upsert(
    {
      user_id:              user.id,
      shop_code:            offer.shopCode,
      title:                offer.title,
      image_url:            offer.imageUrl ?? null,
      product_url:          offer.productUrl,
      affiliate_url:        offer.affiliateUrl ?? null,
      item_price:           offer.itemPrice ?? null,
      shipping_price:       offer.shippingPrice ?? null,
      estimated_total_price: offer.estimatedTotalPrice ?? null,
      currency:             offer.currency,
      price_confidence:     offer.priceConfidence,
    },
    { onConflict: 'user_id,product_url', ignoreDuplicates: true }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath('/favorites/products');
  return { success: true };
}

/**
 * 商品をお気に入りから削除
 */
export async function removeFavoriteProduct(
  productUrl: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Supabase 未設定' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '未ログイン' };

  const { error } = await supabase
    .from('favorite_products')
    .delete()
    .eq('user_id', user.id)
    .eq('product_url', productUrl);

  if (error) return { success: false, error: error.message };

  revalidatePath('/favorites/products');
  return { success: true };
}


// ──────────────────────────────────────────────────────────
// お気に入り検索ワード
// ──────────────────────────────────────────────────────────

/**
 * 検索ワードをお気に入りに追加（重複は upsert で無視）
 */
export async function addFavoriteQuery(
  query: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Supabase 未設定' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '未ログイン' };

  const { error } = await supabase.from('favorite_queries').upsert(
    { user_id: user.id, query: query.trim() },
    { onConflict: 'user_id,query', ignoreDuplicates: true }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath('/favorites/queries');
  return { success: true };
}

/**
 * お気に入り検索ワードを削除
 */
export async function removeFavoriteQuery(
  queryId: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Supabase 未設定' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '未ログイン' };

  const { error } = await supabase
    .from('favorite_queries')
    .delete()
    .eq('id', queryId)
    .eq('user_id', user.id); // RLS 二重チェック

  if (error) return { success: false, error: error.message };

  revalidatePath('/favorites/queries');
  return { success: true };
}


// ──────────────────────────────────────────────────────────
// 検索履歴
// ──────────────────────────────────────────────────────────

/**
 * 検索履歴を保存（Phase 3: 重複チェックなし、毎回 insert）
 *
 * 設計メモ:
 * - 重複排除は Phase 4 以降で実装予定
 * - 現在は同一ワードを何度でも記録する（最新の検索日時が残る）
 */
export async function saveSearchQuery(
  query: string,
  normalizedQuery: string
): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // 未ログインは保存しない

  await supabase.from('search_queries').insert({
    user_id:          user.id,
    query,
    normalized_query: normalizedQuery,
  });
  // エラーは無視（検索の妨げにしない）
}
