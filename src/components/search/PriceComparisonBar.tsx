/**
 * ショップ別 参考価格サマリ (Phase 11)
 *
 * 検索結果の上部に「ショップ別参考最安値」を表示する。
 * Server Component — クライアント状態不要。
 *
 * ⚠️ 表示価格はすべてデモ参考価格です。
 */

import { ProductOffer } from '@/lib/search/adapters/types';
import { getShopByCode } from '@/lib/shops/shops';

interface PriceComparisonBarProps {
  offers: ProductOffer[];
}

interface ShopSummary {
  shopCode: string;
  shopName: string;
  color: string;
  minPrice: number | null;
  hasUnknownShipping: boolean;
  taxNote: string | null;
}

export function PriceComparisonBar({ offers }: PriceComparisonBarProps) {
  // ショップ別に集計
  const map = new Map<
    string,
    { name: string; color: string; prices: number[]; unknownShipping: boolean; hasExcluded: boolean }
  >();

  for (const offer of offers) {
    const shop = getShopByCode(offer.shopCode);
    if (!map.has(offer.shopCode)) {
      map.set(offer.shopCode, {
        name: offer.shopName,
        color: shop?.logoColor ?? '#888',
        prices: [],
        unknownShipping: false,
        hasExcluded: false,
      });
    }
    const entry = map.get(offer.shopCode)!;
    // 合計目安 > 商品価格 の優先度
    const price = offer.estimatedTotalPrice ?? offer.itemPrice;
    if (price != null) entry.prices.push(price);
    if (offer.shippingPrice === undefined || offer.shippingPrice === null) {
      entry.unknownShipping = true;
    }
    if (offer.taxIncludedStatus === 'excluded') entry.hasExcluded = true;
  }

  const summaries: ShopSummary[] = Array.from(map.entries()).map(
    ([shopCode, data]) => ({
      shopCode,
      shopName: data.name,
      color: data.color,
      minPrice: data.prices.length > 0 ? Math.min(...data.prices) : null,
      hasUnknownShipping: data.unknownShipping,
      taxNote: data.hasExcluded ? '税・関税別' : null,
    })
  );

  if (summaries.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">📊 ショップ別 参考価格帯</span>
        <span className="text-xs text-gray-400">（合計目安・参考）</span>
      </div>

      {/* ショップ別最安値グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
        {summaries.map((s) => (
          <div key={s.shopCode} className="px-4 py-3 text-center">
            {/* ショップ名 */}
            <p className="text-xs font-bold mb-1" style={{ color: s.color }}>
              {s.shopName}
            </p>

            {/* 最安値 */}
            {s.minPrice != null ? (
              <p className="text-base font-bold text-gray-900">
                ¥{s.minPrice.toLocaleString()}
                <span className="text-sm font-normal text-gray-400">〜</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}

            {/* 送料・税の注記 */}
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">
              {s.hasUnknownShipping ? '送料別途' : '送料込み'}
              {s.taxNote && (
                <span className="ml-1 text-orange-500">{s.taxNote}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* 免責フッター */}
      <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          ※ 参考価格です。実際の金額・送料・在庫は各ショップの購入画面でご確認ください。
        </p>
      </div>
    </div>
  );
}
