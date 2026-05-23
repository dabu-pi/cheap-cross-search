/**
 * 検索取得状態サマリ (Phase 5)
 *
 * ショップごとの取得方式・結果ステータスをコンパクトに表示する。
 * - 商品取得できたショップ: 緑バッジ
 * - link_only フォールバック中: 黄バッジ
 * - disabled: グレーバッジ
 * - error: 赤バッジ
 */

import type { ShopSearchResult } from '@/lib/search/adapters/types';
import { INTEGRATION_MODE_LABELS } from '@/lib/search/adapters/registry';

interface SearchStatusSummaryProps {
  shops: ShopSearchResult[];
}

const STATUS_BADGE: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  link_only: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  disabled: 'bg-gray-100 text-gray-400 border-gray-200',
  error: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_ICON: Record<string, string> = {
  success: '✓',
  link_only: '🔗',
  disabled: '—',
  error: '!',
};

const STATUS_LABEL: Record<string, string> = {
  success: '取得済み',
  link_only: 'リンクのみ',
  disabled: '無効',
  error: 'エラー',
};

export function SearchStatusSummary({ shops }: SearchStatusSummaryProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {shops.map((shop) => {
        const badge = STATUS_BADGE[shop.status] ?? STATUS_BADGE['link_only'];
        const icon = STATUS_ICON[shop.status] ?? '?';
        const statusLabel = STATUS_LABEL[shop.status] ?? shop.status;
        const modeLabel = INTEGRATION_MODE_LABELS[shop.integrationMode] ?? shop.integrationMode;

        return (
          <div
            key={shop.shopCode}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${badge}`}
            title={`${shop.shopName}: ${modeLabel} — ${statusLabel}${shop.errorMessage ? ` (${shop.errorMessage})` : ''}`}
          >
            <span className="font-medium">{shop.shopName}</span>
            <span className="opacity-60">·</span>
            <span>{icon} {statusLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
