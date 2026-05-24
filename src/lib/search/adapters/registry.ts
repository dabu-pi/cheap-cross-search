/**
 * アダプタ レジストリ (Phase 5 / Phase 17 更新)
 *
 * ショップコードと IntegrationMode からアダプタを選択して返す。
 *
 * フォールバック方針:
 * - official_api:  未実装 or 有効化前 → link_only にフォールバック（警告付き）
 * - affiliate_api: 未承認 or 未設定 → link_only にフォールバック（警告付き）
 * - external_api:  ExternalMockAdapter を使用（本格 API 接続前のモック）
 * - link_only:     LinkOnlyAdapter
 * - disabled:      DisabledAdapter（検索対象外）
 *
 * ─── Phase 22 時点の各ショップ状態 ────────────────────────────────────────
 * | Shop             | integrationMode | 状態                              | アダプタ                  |
 * |------------------|-----------------|-----------------------------------|--------------------------|
 * | Amazon           | link_only       | アソシエイト承認済み / PA-API待ち   | amazon-pa-api.ts (stub)  |
 * | SHEIN            | link_only       | 未申請                            | (未定)                   |
 * | AliExpress       | link_only       | Portals 審査中（2026-05-23申請）   | aliexpress-portals.ts    |
 * | Temu             | link_only       | HOLD                              | (HOLD)                   |
 * | 楽天市場          | official_api    | API即日取得可・RAKUTEN_APP_ID待ち  | rakuten-ichiba.ts ✅     |
 * | Yahoo!ショッピング | official_api   | API即日取得可・YAHOO_APP_ID待ち   | yahoo-shopping.ts ✅     |
 *
 * ─── 実 API 有効化時の手順 ────────────────────────────────────────────────
 * 1. shops.ts で対象ショップの integrationMode を変更
 *    例: amazon → 'official_api', aliexpress → 'affiliate_api'
 * 2. 下記 switch のコメントを外して対象アダプタを登録
 * 3. .env.local / Vercel env に API キーを設定（commit 禁止）
 * 4. live-check で動作確認
 *
 * @see amazon-pa-api.ts       Amazon PA-API スタブ（売上3件後に有効化）
 * @see aliexpress-portals.ts  AliExpress Portals スタブ（承認後に有効化）
 * @see external-mock.ts       外部 API モックアダプタのリファレンス実装
 * @see link-only.ts           link_only アダプタ（フォールバック）
 * @see disabled.ts            disabled アダプタ
 * @see docs/ADAPTER_DEVELOPMENT_GUIDE.md  有効化手順詳細
 */

import type { SearchAdapter, IntegrationMode } from './types';
import { LinkOnlyAdapter } from './link-only';
import { DisabledAdapter } from './disabled';
import { ExternalMockAdapter } from './external-mock';
// Phase 17 スタブ（アクティブ化時に使用 — 現在は import のみ）
// import { AmazonPaApiAdapter } from './amazon-pa-api';
// import { AliExpressPortalsAdapter } from './aliexpress-portals';
// Phase 22: 楽天・Yahoo! 実商品APIアダプタ
import { RakutenIchibaAdapter } from './rakuten-ichiba';
import { YahooShoppingAdapter } from './yahoo-shopping';

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
      // ── Phase 17: Amazon PA-API スタブ ───────────────────────────────
      // PA-API 有効化後は下記のコメントを外して有効化する:
      // if (shopCode === 'amazon') return new AmazonPaApiAdapter();
      // ─────────────────────────────────────────────────────────────────
      // ── Phase 22: 楽天・Yahoo! 実商品APIアダプタ ─────────────────────
      // RAKUTEN_APP_ID / YAHOO_APP_ID が設定されている場合は実APIを使用。
      // 未設定の場合はアダプタ内部で link_only にフォールバック（警告付き）。
      if (shopCode === 'rakuten') return new RakutenIchibaAdapter();
      if (shopCode === 'yahoo') return new YahooShoppingAdapter();
      // ─────────────────────────────────────────────────────────────────
      fallbackWarnings?.push(
        `[${shopCode}] official_api は準備中です。link_only にフォールバックします。`
      );
      return new LinkOnlyAdapter(shopCode);

    case 'affiliate_api':
      // ── Phase 17: AliExpress Portals スタブ ──────────────────────────
      // Portals 承認後は下記のコメントを外して有効化する:
      // if (shopCode === 'aliexpress') return new AliExpressPortalsAdapter();
      // ─────────────────────────────────────────────────────────────────
      fallbackWarnings?.push(
        `[${shopCode}] affiliate_api は準備中です。link_only にフォールバックします。`
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
