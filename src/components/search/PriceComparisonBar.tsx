'use client';

/**
 * ショップ別 参考価格サマリ (Phase 11 / Phase 12 更新)
 *
 * - Phase 11: 検索結果上部にショップ別参考最安値を表示
 * - Phase 12: クリックでショップフィルターと連動（onShopSelect / selectedShop）
 *
 * ⚠️ 表示価格はすべてデモ参考価格です。
 */

import { ProductOffer } from '@/lib/search/adapters/types';
import { getShopByCode } from '@/lib/shops/shops';

interface PriceComparisonBarProps {
  offers: ProductOffer[];
  /** 現在フィルター中のショップコード（'all' or shopCode） */
  selectedShop?: string;
  /** ショップセルクリック時のコールバック（省略時はボタン化しない） */
  onShopSelect?: (shopCode: string) => void;
}

interface ShopSummary {
  shopCode: string;
  shopName: string;
  color: string;
  minPrice: number | null;
  hasUnknownShipping: boolean;
  taxNote: string | null;
}

export function PriceComparisonBar({
  offers,
  selectedShop = 'all',
  onShopSelect,
}: PriceComparisonBarProps) {
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

  const isInteractive = !!onShopSelect;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">📊 ショップ別 参考価格帯</span>
        <span className="text-xs text-gray-400">（合計目安・参考）</span>
        {isInteractive && (
          <span className="text-xs text-gray-400 ml-auto">タップで絞り込み</span>
        )}
      </div>

      {/* ショップ別最安値グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
        {summaries.map((s) => {
          const isSelected = selectedShop === s.shopCode;
          const isAllSelected = selectedShop === 'all';

          const cellContent = (
            <>
              {/* ショップ名 */}
              <p
                className="text-xs font-bold mb-1 transition-colors"
                style={{ color: isSelected ? '#fff' : s.color }}
              >
                {s.shopName}
                {isSelected && <span className="ml-1 text-xs opacity-80">✓ 絞込中</span>}
              </p>

              {/* 最安値 */}
              {s.minPrice != null ? (
                <p
                  className="text-base font-bold transition-colors"
                  style={{ color: isSelected ? '#fff' : '#111827' }}
                >
                  ¥{s.minPrice.toLocaleString()}
                  <span
                    className="text-sm font-normal"
                    style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}
                  >
                    〜
                  </span>
                </p>
              ) : (
                <p className="text-sm" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>—</p>
              )}

              {/* 送料・税の注記 */}
              <p
                className="text-xs mt-0.5 leading-snug"
                style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : '#6b7280' }}
              >
                {s.hasUnknownShipping ? '送料別途' : '送料込み'}
                {s.taxNote && (
                  <span className="ml-1" style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : '#f97316' }}>
                    {s.taxNote}
                  </span>
                )}
              </p>
            </>
          );

          if (isInteractive) {
            return (
              <button
                key={s.shopCode}
                onClick={() => onShopSelect(s.shopCode)}
                aria-pressed={isSelected}
                className={`px-4 py-3 text-center w-full transition-all ${
                  isSelected
                    ? 'ring-2 ring-inset'
                    : isAllSelected
                      ? 'hover:bg-gray-50'
                      : 'opacity-50 hover:opacity-80 hover:bg-gray-50'
                }`}
                style={isSelected ? { backgroundColor: s.color, outline: `2px solid ${s.color}` } : {}}
                title={isSelected ? `${s.shopName}の絞り込みを解除` : `${s.shopName}に絞り込む`}
              >
                {cellContent}
              </button>
            );
          }

          return (
            <div key={s.shopCode} className="px-4 py-3 text-center">
              {cellContent}
            </div>
          );
        })}
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
