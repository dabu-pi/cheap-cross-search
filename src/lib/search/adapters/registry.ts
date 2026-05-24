/**
 * アダプタ レジストリ (Phase 5)
 *
 * ショップコードと IntegrationMode からアダプタを選択して返す。
 *
 * フォールバック方針:
 * - official_api:  未実装 → link_only にフォールバック（警告付き）
 * - affiliate_api: 未実装 → link_only にフォールバック（警告付き）
 * - external_api:  ExternalMockAdapter を使用（本格 API 接続前のモック）
 * - link_only:     LinkOnlyAdapter
 * - disabled:      DisabledAdapter（検索対象外）
 *
 * 将来の本格 API アダプタ追加手順:
 * 1. `src/lib/search/adapters/{shopCode}-{mode}.ts` を作成
 * 2. 下記の switch に新ケースを追加
 * 3. shops.ts / 管理画面 DB で integrationMode を更新
 *
 * @see external-mock.ts  外部 API モックアダプタのリファレンス実装
 * @see link-only.ts      link_only アダプタ（フォールバック）
 * @see disabled.ts       disabled アダプタ
 */

import type { SearchAdapter, IntegrationMode } from './types';
import { LinkOnlyAdapter } from './link-only';
import { DisabledAdapter } from './disabled';
import { ExternalMockAdapter } from './external-mock';

/**
 * ショップ + モードに対応するアダプタを返す。
 *
 * @param shopCode  ショップコード（shops.ts の code）
 * @param mode      取得方式
 * @param fallbackWarnings  フォールバック発生時の警告を push する配列（省略可）
 */
export function getAdapter(
  shopCode: string,
  mode: IntegrationMode,
  fallbackWarnings?: string[]
): SearchAdapter {
  switch (mode) {
    case 'disabled':
      return new DisabledAdapter(shopCode);

    case 'external_api':
      return new ExternalMockAdapter(shopCode);

    case 'official_api':
      // 未実装 → link_only フォールバック
      fallbackWarnings?.push(
        `[${shopCode}] official_api は未実装です。link_only にフォールバックします。`
      );
      return new LinkOnlyAdapter(shopCode);

    case 'affiliate_api':
      // 未実装 → link_only フォールバック
      fallbackWarnings?.push(
        `[${shopCode}] affiliate_api は未実装です。link_only にフォールバックします。`
      );
      return new LinkOnlyAdapter(shopCode);

    case 'link_only':
    default:
      return new LinkOnlyAdapter(shopCode);
  }
}

/**
 * アダプタが「実際に商品オファーを返せる」モードかどうか判定。
 * UI でのバッジ表示に使用。
 */
export function canReturnOffers(mode: IntegrationMode): boolean {
  return mode === 'official_api' || mode === 'affiliate_api' || mode === 'external_api';
}

/**
 * 取得方式の日本語ラベル（UI 表示用）
 */
export const INTEGRATION_MODE_LABELS: Record<IntegrationMode, string> = {
  official_api: '公式API',
  affiliate_api: 'アフィリエイトAPI',
  external_api: '外部API',
  link_only: '検索対応',
  disabled: '無効',
};

/**
 * 取得方式の色クラス（UI 表示用）
 */
export const INTEGRATION_MODE_COLORS: Record<IntegrationMode, string> = {
  official_api: 'bg-green-100 text-green-700',
  affiliate_api: 'bg-blue-100 text-blue-700',
  external_api: 'bg-purple-100 text-purple-700',
  link_only: 'bg-yellow-100 text-yellow-700',
  disabled: 'bg-gray-100 text-gray-400',
};
