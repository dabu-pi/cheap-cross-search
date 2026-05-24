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
}

/**
 * 商品カード一覧 + 並び替え + ショップフィルター UI（Client Component）
 *
 * - ショップフィルター: クライアントサイドでショップ絞り込み（Phase 11）
 * - 並び替え: クライアントサイドで即時反映（ページリロードなし）
 * - Phase 7: cautionMap で要注意ラベルを表示
 */
export function ProductCardGrid({ offers, cautionMap, query }: ProductCardGridProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended');
  const [shopFilter, setShopFilter] = useState<string>('all');

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

  // ソート → ショップフィルター の順で適用
  const sorted   = sortOffers(offers, sortOrder);
  const filtered = shopFilter === 'all'
    ? sorted
    : sorted.filter((o) => o.shopCode === shopFilter);

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
          onClick={() => setShopFilter('all')}
          aria-pressed={shopFilter === 'all'}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
            shopFilter === 'all'
              ? 'bg-gray-800 text-white border-gray-800 font-semibold'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
          }`}
        >
          すべて ({offers.length})
        </button>

        {/* 各ショップ */}
        {Array.from(shopCounts.entries()).map(([code, { name, color, count }]) => {
          const isActive = shopFilter === code;
          return (
            <button
              key={code}
              onClick={() => setShopFilter(code)}
              aria-pressed={isActive}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-white font-semibold'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color }
                  : { '--hover-color': color } as React.CSSProperties
              }
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
        {shopFilter !== 'all' && (
          <button
            onClick={() => setShopFilter('all')}
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
              onClick={() => setShopFilter('all')}
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
