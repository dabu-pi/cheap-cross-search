'use client';

/**
 * 比較セクション全体ラッパー (Phase 12)
 *
 * PriceComparisonBar と ProductCardGrid の間で shopFilter 状態を共有する。
 * Server Component (search/page.tsx) からデータを受け取り、
 * クライアントサイドでフィルター操作を即時反映する。
 */

import { useState } from 'react';
import { ProductOffer } from '@/lib/search/adapters/types';
import { PriceComparisonBar } from './PriceComparisonBar';
import { ProductCardGrid } from './ProductCardGrid';

interface ComparisonSectionProps {
  /** 表示対象オファー一覧 */
  offers: ProductOffer[];
  /**
   * 要注意商品マップ（シリアライズ可能な Record 形式）
   * Server Component → Client Component の境界を越えるため Record を使用
   */
  cautionRecord: Record<string, string>;
  /** 検索クエリ */
  query: string;
}

export function ComparisonSection({ offers, cautionRecord, query }: ComparisonSectionProps) {
  const [shopFilter, setShopFilter] = useState<string>('all');

  // Record → Map 変換（ProductCardGrid は Map を期待）
  const cautionMap = new Map(Object.entries(cautionRecord));

  // PriceComparisonBar のショップセルクリック: 同一ショップを再クリックで解除
  const handleShopSelect = (shopCode: string) => {
    setShopFilter((prev) => (prev === shopCode ? 'all' : shopCode));
  };

  return (
    <div className="space-y-4">
      {/* ショップ別参考価格帯 + クリックフィルター */}
      <PriceComparisonBar
        offers={offers}
        selectedShop={shopFilter}
        onShopSelect={handleShopSelect}
      />

      {/* 商品カード一覧 + ショップフィルター + 並び替え */}
      <ProductCardGrid
        offers={offers}
        cautionMap={cautionMap}
        query={query}
        shopFilter={shopFilter}
        onShopFilterChange={setShopFilter}
      />
    </div>
  );
}
