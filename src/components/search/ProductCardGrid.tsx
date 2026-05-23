'use client';

import { useState } from 'react';
import { ProductOffer } from '@/lib/search/adapters/types';
import { SortOrder, SORT_OPTIONS, sortOffers } from '@/lib/search/sort';
import { ProductCard } from './ProductCard';

interface ProductCardGridProps {
  /** サーバーから渡されるオファー一覧 */
  offers: ProductOffer[];
}

/**
 * 商品カード一覧 + 並び替えUI（Client Component）
 * - 並び替えはクライアントサイドで即時反映（ページリロードなし）
 * - offers はサーバーから渡す（Server Component 側で取得）
 */
export function ProductCardGrid({ offers }: ProductCardGridProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended');
  const sorted = sortOffers(offers, sortOrder);

  return (
    <div className="space-y-4">

      {/* 並び替えバー */}
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
        {sorted.length} 件
      </p>

      {/* 商品カード一覧 */}
      <div className="space-y-3">
        {sorted.map((offer) => (
          <ProductCard key={offer.id} offer={offer} />
        ))}
      </div>

    </div>
  );
}
