import { ProductOffer } from './adapters/types';
import { getShopByCode } from '@/lib/shops/shops';

export type SortOrder =
  | 'price_asc'
  | 'price_desc'
  | 'recommended'
  | 'shop_order'
  | 'delivery_fast'
  | 'rating_desc'
  | 'review_count_desc';

export interface SortOption {
  value: SortOrder;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'price_asc',          label: '参考価格が安い順' },
  { value: 'price_desc',         label: '参考価格が高い順' },
  { value: 'recommended',        label: 'おすすめ順' },
  { value: 'shop_order',         label: 'ショップ順' },
  { value: 'delivery_fast',      label: '到着が早い順' },
  { value: 'rating_desc',        label: '評価が高い順' },
  { value: 'review_count_desc',  label: 'レビュー多い順' },
];

/** ソート末尾へ追いやるための大きな数 */
const LARGE = 999_999_999;

/**
 * おすすめスコア（低いほど上位）
 * 材料: 合計見込み価格・評価・レビュー数・ショップ信頼度・価格信頼度
 * 欠損値は中位扱い（クラッシュしない）
 */
function recommendedScore(offer: ProductOffer): number {
  const shop = getShopByCode(offer.shopCode);
  const trustScore = shop?.trustScore ?? 50;

  // 合計見込み価格（安いほど低スコア = 上位）
  const priceScore = (offer.estimatedTotalPrice ?? offer.itemPrice ?? LARGE) * 0.5;

  // 評価ペナルティ（高評価ほど低スコア）
  const ratingPenalty =
    offer.rating != null ? (5 - offer.rating) * 200 : 600;

  // レビュー数ペナルティ（多いほど低スコア）
  const reviewPenalty =
    offer.reviewCount != null
      ? Math.max(0, 800 - Math.log10(offer.reviewCount + 1) * 250)
      : 600;

  // ショップ信頼度ペナルティ（高信頼ほど低スコア）
  const trustPenalty = (100 - trustScore) * 8;

  // 価格信頼度ペナルティ
  const confidencePenalty =
    offer.priceConfidence === 'high'   ? 0 :
    offer.priceConfidence === 'medium' ? 300 :
    offer.priceConfidence === 'low'    ? 1000 : 2000;

  return priceScore + ratingPenalty + reviewPenalty + trustPenalty + confidencePenalty;
}

/**
 * 商品オファーを指定の並び順でソート（非破壊・欠損値安全）
 */
export function sortOffers(offers: ProductOffer[], order: SortOrder): ProductOffer[] {
  const arr = [...offers];

  switch (order) {
    case 'price_asc':
      return arr.sort((a, b) => {
        const pa = a.estimatedTotalPrice ?? a.itemPrice ?? LARGE;
        const pb = b.estimatedTotalPrice ?? b.itemPrice ?? LARGE;
        return pa - pb;
      });

    case 'price_desc':
      return arr.sort((a, b) => {
        const pa = a.estimatedTotalPrice ?? a.itemPrice ?? 0;
        const pb = b.estimatedTotalPrice ?? b.itemPrice ?? 0;
        return pb - pa;
      });

    case 'recommended':
      return arr.sort((a, b) => recommendedScore(a) - recommendedScore(b));

    case 'shop_order':
      // Amazon(1) → SHEIN(2) → AliExpress(3) → Temu(4) → 各ショップ内は参考価格安い順
      return arr.sort((a, b) => {
        const orderA = getShopByCode(a.shopCode)?.displayOrder ?? 99;
        const orderB = getShopByCode(b.shopCode)?.displayOrder ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const pa = a.estimatedTotalPrice ?? a.itemPrice ?? LARGE;
        const pb = b.estimatedTotalPrice ?? b.itemPrice ?? LARGE;
        return pa - pb;
      });

    case 'delivery_fast':
      // deliveryEstimateText あり → なし の順。同条件は参考価格安い順
      return arr.sort((a, b) => {
        const hasA = a.deliveryEstimateText ? 0 : 1;
        const hasB = b.deliveryEstimateText ? 0 : 1;
        if (hasA !== hasB) return hasA - hasB;
        return (a.itemPrice ?? LARGE) - (b.itemPrice ?? LARGE);
      });

    case 'rating_desc':
      return arr.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));

    case 'review_count_desc':
      return arr.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));

    default:
      return arr;
  }
}
