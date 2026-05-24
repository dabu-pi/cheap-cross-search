/**
 * 検索取得状態サマリ (Phase 5 / Phase 17 更新)
 *
 * ショップごとの取得方式・結果ステータスをコンパクトに表示する。
 * - 商品取得できたショップ: 緑バッジ
 * - link_only フォールバック中: 青バッジ
 * - disabled: グレーバッジ
 * - error: 赤バッジ
 *
 * Phase 17: ツールチップ (title) にアフィリエイト承認状態を追加。
 *           バッジの表示文言は変更しない（既存テスト回帰を保護）。
 */

import type { ShopSearchResult, AffiliateApprovalStatus } from '@/lib/search/adapters/types';
import { INTEGRATION_MODE_LABELS } from '@/lib/search/adapters/registry';
import { getShopByCode } from '@/lib/shops/shops';

/** アフィリエイト承認状態のツールチップ用ラベル（内部専用） */
const AFFILIATE_STATUS_TOOLTIP: Record<AffiliateApprovalStatus, string> = {
  approved:    '提携承認済み',
  pending:     '審査中',
  not_applied: '未申請',
  hold:        'HOLD',
};

interface SearchStatusSummaryProps {
  shops: ShopSearchResult[];
}

const STATUS_BADGE: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  link_only: 'bg-blue-50 text-blue-600 border-blue-200',
  disabled: 'bg-gray-100 text-gray-400 border-gray-200',
  error: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_ICON: Record<string, string> = {
  success: '✓',
  link_only: '🛒',
  disabled: '—',
  error: '!',
};

const STATUS_LABEL: Record<string, string> = {
  success: '取得済み',
  link_only: '検索対応',
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

        // Phase 17: ショップ定義からアフィリエイト承認状態を取得してツールチップに追加
        const shopDef = getShopByCode(shop.shopCode);
        const affiliateTooltip = shopDef
          ? ` | 提携: ${AFFILIATE_STATUS_TOOLTIP[shopDef.affiliateApprovalStatus]}`
          : '';

        return (
          <div
            key={shop.shopCode}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${badge}`}
            title={`${shop.shopName}: ${modeLabel} — ${statusLabel}${shop.errorMessage ? ` (${shop.errorMessage})` : ''}${affiliateTooltip}`}
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
