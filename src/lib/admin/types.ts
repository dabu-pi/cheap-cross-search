/**
 * 管理画面用型定義 (Phase 4)
 *
 * 現時点ではデモデータ / 静的設定ベース。
 * Supabase 設定後に DB テーブル (admin_shop_configs / admin_affiliate_configs /
 * blocked_keywords / fetch_logs) へ移行する想定。
 */

import type { IntegrationMode } from '@/lib/search/adapters/types';

// ─────────────────────────────────────────────────────────────
// ショップ管理
// ─────────────────────────────────────────────────────────────

export interface ShopAdminConfig {
  /** shops.ts の code と同一 */
  shopCode: string;
  shopName: string;
  enabled: boolean;
  displayOrder: number;
  integrationMode: IntegrationMode;
  /** 検索URLテンプレート ({query} を置換) */
  searchUrlTemplate: string;
  /** ショップTOPページ */
  baseUrl: string;
  /** 現在の API 接続状態 */
  apiStatus: 'connected' | 'degraded' | 'disconnected' | 'not_configured';
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  notes: string;
}

export type ApiStatus = ShopAdminConfig['apiStatus'];

// ─────────────────────────────────────────────────────────────
// アフィリエイト設定
// ─────────────────────────────────────────────────────────────

export interface AffiliateConfig {
  shopCode: string;
  shopName: string;
  enabled: boolean;
  affiliateId: string;
  /** アフィリエイトリンクテンプレート ({product_url} or {asin} 等を置換) */
  linkTemplate: string;
  /** 商品価格の表示許可 */
  priceDisplayAllowed: boolean;
  /** 商品画像の表示許可 */
  imageDisplayAllowed: boolean;
  /** キャッシュ許容時間 (分) */
  cacheMinutes: number;
  notes: string;
}

// ─────────────────────────────────────────────────────────────
// 除外キーワード
// ─────────────────────────────────────────────────────────────

export type BlockedKeywordMatchType = 'exact' | 'partial' | 'regex';
export type BlockedKeywordCategory =
  | 'pharmaceutical'
  | 'weapon'
  | 'counterfeit'
  | 'adult'
  | 'hazardous'
  | 'surveillance'
  | 'other';

export interface BlockedKeyword {
  id: string;
  keyword: string;
  matchType: BlockedKeywordMatchType;
  category: BlockedKeywordCategory;
  reason: string;
  enabled: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// 取得ログ / 状態
// ─────────────────────────────────────────────────────────────

export type FetchLogStatus = 'success' | 'degraded' | 'error' | 'disabled';

export interface FetchLogEntry {
  shopCode: string;
  shopName: string;
  integrationMode: IntegrationMode;
  status: FetchLogStatus;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  fallbackCount: number;
  message: string;
}
