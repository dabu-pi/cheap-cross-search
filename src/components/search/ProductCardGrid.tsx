'use client';

import { useState, useMemo } from 'react';
import { ProductOffer } from '@/lib/search/adapters/types';
import { SortOrder, SORT_OPTIONS, sortOffers } from '@/lib/search/sort';
import { getShopByCode } from '@/lib/shops/shops';
import { ProductCard } from './ProductCard';

interface ProductCardGridProps {
  /** サーバーから渡されるオファー一覧 */
  offers: ProductOffer[];
  /** Phase 7: 要注意商品の offerId → 理由 マップ（Server から渡す）*/
  cautionMap?: Map<string, string>;
  /** 検索クエリ（クリック計測に使用）*/
  query?: string;
  /**
   * Phase 12: 外部制御モード（ComparisonSection から渡す）
   * 省略時は内部 state で自己管理。
   */
  shopFilter?: string;
  onShopFilterChange?: (shopCode: string) => void;
}

/**
 * 商品カード一覧 + 並び替え + ショップフィルター UI（Client Component）
 *
 * - Phase 11: ショップフィルター（内部 state）
 * - Phase 12: 外部制御モード対応（ComparisonSection 経由で PriceComparisonBar と連動）
 * - Phase 12: 並び替えに「参考価格が高い順」「ショップ順」追加、デフォルト「参考価格が安い順」
 */
export function ProductCardGrid({
  offers,
  cautionMap,
  query,
  shopFilter: externalShopFilter,
  onShopFilterChange,
}: ProductCardGridProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
  // 外部制御 or 内部 state
  const [internalShopFilter, setInternalShopFilter] = useState<string>('all');
  const activeShopFilter = externalShopFilter !== undefined ? externalShopFilter : internalShopFilter;

  const handleShopFilterChange = (code: string) => {
    if (onShopFilterChange) onShopFilterChange(code);
    else setInternalShopFilter(code);
  };

  /** ショップ別件数（フィルター前） */
  const shopCounts = useMemo(() => {
    const counts = new Map<string, { name: string; color: string; count: number }>();
    for (const offer of offers) {
      const existing = counts.get(offer.shopCode);
      if (existing) {
        existing.count++;
      } else {
        const shop = getShopByCode(offer.shopCode);
        counts.set(offer.shopCode, {
          name: offer.shopName,
          color: shop?.logoColor ?? '#888',
          count: 1,
        });
      }
    }
    return counts;
  }, [offers]);

  // ソート → ショップフィルターの順で適用
  const sorted   = sortOffers(offers, sortOrder);
  const filtered = activeShopFilter === 'all'
    ? sorted
    : sorted.filter((o) => o.shopCode === activeShopFilter);

  return (
    <div className="space-y-3">

      {/* ─── ショップフィルター ─── */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="ショップ絞り込み"
      >
        <span className="text-xs text-gray-400 shrink-0">ショップ:</span>

        {/* 「すべて」 */}
        <button
          onClick={() => handleShopFilterChange('all')}
          aria-pressed={activeShopFilter === 'all'}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
            activeShopFilter === 'all'
              ? 'bg-gray-800 text-white border-gray-800 font-semibold'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
          }`}
        >
          すべて ({offers.length})
        </button>

        {/* 各ショップ */}
        {Array.from(shopCounts.entries()).map(([code, { name, color, count }]) => {
          const isActive = activeShopFilter === code;
          return (
            <button
              key={code}
              onClick={() => handleShopFilterChange(isActive ? 'all' : code)}
              aria-pressed={isActive}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-white font-semibold'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                  (e.currentTarget as HTMLButtonElement).style.color = color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '';
                  (e.currentTarget as HTMLButtonElement).style.color = '';
                }
              }}
            >
              {name} ({count})
            </button>
          );
        })}
      </div>

      {/* ─── 並び替えバー ─── */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="並び替え"
      >
        <span className="text-xs text-gray-400 shrink-0">並び替え:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortOrder(opt.value)}
            aria-pressed={sortOrder === opt.value}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              sortOrder === opt.value
                ? 'bg-orange-500 text-white border-orange-500 font-semibold'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 件数 */}
      <p className="text-xs text-gray-400">
        {filtered.length} 件
        {activeShopFilter !== 'all' && (
          <button
            onClick={() => handleShopFilterChange('all')}
            className="ml-2 text-blue-400 hover:underline"
          >
            絞り込み解除
          </button>
        )}
      </p>

      {/* ─── 商品カード一覧 ─── */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((offer) => (
            <ProductCard
              key={offer.id}
              offer={offer}
              query={query}
              cautionReason={cautionMap?.get(offer.id)}
            />
          ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center space-y-1">
            <p className="text-sm text-gray-500">このショップの商品は表示できません</p>
            <button
              onClick={() => handleShopFilterChange('all')}
              className="text-xs text-blue-500 hover:underline"
            >
              すべてのショップを表示
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
