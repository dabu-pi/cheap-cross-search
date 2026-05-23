/**
 * 価格表示ユーティリティ
 * null / undefined 安全対応
 * 通貨が将来増えても拡張しやすい構造
 */

/**
 * 本体価格をフォーマット
 * @example formatPrice(1280)        → "¥1,280"
 * @example formatPrice(undefined)   → "価格不明"
 */
export function formatPrice(
  amount: number | undefined | null,
  currency = 'JPY'
): string {
  if (amount == null) return '価格不明';
  if (currency === 'JPY') {
    return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * 送料をフォーマット
 * @example formatShipping(0)    → "送料無料"
 * @example formatShipping(500)  → "送料 ¥500"
 * @example formatShipping(null) → "送料不明"
 */
export function formatShipping(amount: number | undefined | null): string {
  if (amount == null) return '送料不明';
  if (amount === 0) return '送料無料';
  return `送料 ¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * 合計見込み価格をフォーマット
 * @returns null なら非表示（itemPrice がない場合）
 */
export function formatTotalEstimate(
  itemPrice: number | undefined | null,
  shippingPrice: number | undefined | null
): string | null {
  if (itemPrice == null) return null;
  if (shippingPrice == null) {
    return `¥${Math.round(itemPrice).toLocaleString('ja-JP')} + 送料別途`;
  }
  const total = itemPrice + shippingPrice;
  return `合計目安 ¥${Math.round(total).toLocaleString('ja-JP')}`;
}

/**
 * 評価をフォーマット
 * @example formatRating(4.2) → "★4.2"
 * @returns null なら非表示
 */
export function formatRating(rating: number | undefined | null): string | null {
  if (rating == null) return null;
  const clamped = Math.min(5, Math.max(0, rating));
  return `★${clamped.toFixed(1)}`;
}

/**
 * レビュー数をフォーマット
 * @example formatReviewCount(12345)  → "1.2万件"
 * @example formatReviewCount(567)    → "567件"
 * @returns null なら非表示
 */
export function formatReviewCount(count: number | undefined | null): string | null {
  if (count == null) return null;
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万件`;
  return `${count.toLocaleString('ja-JP')}件`;
}
