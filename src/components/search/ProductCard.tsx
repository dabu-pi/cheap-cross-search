import { ProductOffer } from '@/lib/search/adapters/types';
import { getShopByCode } from '@/lib/shops/shops';
import {
  formatPrice,
  formatShipping,
  formatTotalEstimate,
  formatRating,
  formatReviewCount,
} from '@/lib/format/price';
import { FavoriteProductButton } from './FavoriteProductButton';

interface ProductCardProps {
  offer: ProductOffer;
}

const CONFIDENCE_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  high:    { label: '価格確度: 高', className: 'bg-green-100 text-green-700' },
  medium:  { label: '価格確度: 中', className: 'bg-yellow-100 text-yellow-700' },
  low:     { label: '価格確度: 低', className: 'bg-red-100 text-red-600' },
  unknown: { label: '価格参考',     className: 'bg-gray-100 text-gray-500' },
};

/**
 * 商品比較カード
 * - affiliateUrl があれば優先
 * - 欠損値でクラッシュしない
 * - お気に入り / 問題報告は Phase 3+ 向けプレースホルダー
 */
export function ProductCard({ offer }: ProductCardProps) {
  const shop       = getShopByCode(offer.shopCode);
  const logoColor  = shop?.logoColor ?? '#666';
  const linkUrl    = offer.affiliateUrl ?? offer.productUrl;
  const confidence = CONFIDENCE_BADGE[offer.priceConfidence] ?? CONFIDENCE_BADGE.unknown;

  const totalText  = formatTotalEstimate(offer.itemPrice ?? null, offer.shippingPrice ?? null);
  const ratingText = formatRating(offer.rating ?? null);
  const reviewText = formatReviewCount(offer.reviewCount ?? null);

  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden transition-shadow hover:shadow-md">

      {/* ─── ショップヘッダー ─── */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderLeft: `4px solid ${logoColor}` }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: logoColor }}
          >
            {offer.shopName}
          </span>
          {offer.isSponsored && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">
              PR
            </span>
          )}
          {offer.source === 'demo' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-400 border border-blue-200">
              デモ
            </span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${confidence.className}`}>
          {confidence.label}
        </span>
      </div>

      {/* ─── 商品本体 ─── */}
      <div className="px-4 py-3 flex gap-3">
        {/* 画像プレースホルダー（外部URLなし → ロゴカラーで代替） */}
        <div
          className="w-16 h-16 shrink-0 rounded-xl flex items-center justify-center text-2xl font-black select-none"
          style={{
            backgroundColor: logoColor + '22',
            color: logoColor,
            border: `1.5px solid ${logoColor}44`,
          }}
          aria-label={`${offer.shopName}の商品`}
        >
          {offer.shopName.charAt(0)}
        </div>

        {/* 商品情報 */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* 商品名 */}
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {offer.title}
          </p>

          {/* 価格 + 送料 */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(offer.itemPrice ?? null)}
            </span>
            <span className="text-xs text-gray-500">
              {formatShipping(offer.shippingPrice ?? null)}
            </span>
          </div>

          {/* 合計見込み */}
          {totalText && (
            <p className="text-xs font-semibold text-orange-600">{totalText}</p>
          )}

          {/* 到着予定 */}
          {offer.deliveryEstimateText && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <span aria-hidden>🚚</span>
              {offer.deliveryEstimateText}
            </p>
          )}

          {/* 評価 + レビュー数 */}
          {(ratingText ?? reviewText) && (
            <p className="text-xs text-gray-500">
              {ratingText && (
                <span className="text-yellow-500 font-medium">{ratingText}</span>
              )}
              {ratingText && reviewText && ' '}
              {reviewText && <span>({reviewText})</span>}
            </p>
          )}

          {/* 税込み / 税別表示 */}
          {offer.taxIncludedStatus === 'included' && (
            <p className="text-xs text-gray-400">税込</p>
          )}
          {offer.taxIncludedStatus === 'excluded' && (
            <p className="text-xs text-orange-500">税別 ※関税が別途かかる場合あり</p>
          )}
        </div>
      </div>

      {/* ─── アクションバー ─── */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
        {/* お気に入り（Phase 3: Supabase Auth 連動） */}
        <FavoriteProductButton offer={offer} />

        <div className="flex items-center gap-3">
          {/* 問題報告（Phase 3+ プレースホルダー） */}
          <button
            className="text-xs text-gray-300 hover:text-gray-400 transition-colors cursor-not-allowed"
            title="価格・情報の問題を報告（準備中）"
            disabled
            aria-label="問題を報告（準備中）"
          >
            ⚑
          </button>

          {/* 商品ページへ */}
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-semibold text-white px-4 py-1.5 rounded-xl transition-opacity hover:opacity-85 active:opacity-70"
            style={{ backgroundColor: logoColor }}
            aria-label={`${offer.shopName}で商品ページを開く`}
          >
            商品ページへ
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* ─── 参考価格注意文 ─── */}
      <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-tight">
          ※ 表示価格は取得時の参考価格です。実際の金額・送料・在庫は各ショップでご確認ください。
        </p>
      </div>

    </div>
  );
}
