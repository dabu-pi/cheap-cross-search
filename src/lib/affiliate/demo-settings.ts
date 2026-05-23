/**
 * アフィリエイト設定デモデータ (Phase 6)
 *
 * ⚠️ 本番アフィリエイトID は絶対に Git に入れないこと。
 * affiliateId はすべて空文字（デモ用）。実 ID は .env.local または Supabase DB で管理。
 *
 * 将来の実装:
 * - 環境変数から取得: process.env.AFFILIATE_ID_AMAZON 等
 * - または Supabase affiliate_settings テーブルから取得
 */

import type { AffiliateSettings } from './types';
import { buildAffiliateUrl } from './link-builder';

export function getDemoAffiliateSettings(): AffiliateSettings[] {
  return [
    {
      shopCode: 'amazon',
      shopName: 'Amazon',
      enabled: false,
      affiliateId: '', // ⚠️ 実ID は .env.local に AFFILIATE_ID_AMAZON として設定
      // テンプレート: 商品URL に tag パラメータを追記
      linkTemplate: '',
      trackingParams: { tag: '{affiliate_id}' },
      priceDisplayAllowed: true,
      imageDisplayAllowed: true,
      cacheTtlMinutes: 60,
      notes: 'Amazon アソシエイトプログラム申請が必要。PA-API 利用には審査が必要。',
    },
    {
      shopCode: 'shein',
      shopName: 'SHEIN',
      enabled: false,
      affiliateId: '', // ⚠️ 実ID は .env.local に AFFILIATE_ID_SHEIN として設定
      linkTemplate: '',
      trackingParams: { ref: '{affiliate_id}' },
      priceDisplayAllowed: true,
      imageDisplayAllowed: true,
      cacheTtlMinutes: 120,
      notes: 'SHEIN アフィリエイトプログラムへの参加が必要。',
    },
    {
      shopCode: 'aliexpress',
      shopName: 'AliExpress',
      enabled: false,
      affiliateId: '', // ⚠️ 実ID は .env.local に AFFILIATE_ID_ALIEXPRESS として設定
      linkTemplate: 'https://s.click.aliexpress.com/e/{affiliate_id}?productUrl={product_url}',
      trackingParams: {},
      priceDisplayAllowed: true,
      imageDisplayAllowed: true,
      cacheTtlMinutes: 180,
      notes: 'AliExpress Affiliate Program API 経由のトラッキングリンクを使用する。',
    },
    {
      shopCode: 'temu',
      shopName: 'Temu',
      enabled: false,
      affiliateId: '', // ⚠️ 実ID は .env.local に AFFILIATE_ID_TEMU として設定
      linkTemplate: '',
      trackingParams: { refer_source: '{affiliate_id}' },
      priceDisplayAllowed: true,
      imageDisplayAllowed: false,
      cacheTtlMinutes: 240,
      notes: 'Temu アフィリエイト申請が必要。画像利用条件は要確認。',
    },
  ];
}

/**
 * ショップコードから設定を取得
 */
export function getAffiliateSettingsByShop(shopCode: string): AffiliateSettings | undefined {
  return getDemoAffiliateSettings().find((s) => s.shopCode === shopCode);
}

/**
 * テストリンクプレビューを生成（デモ用・実際の affiliate URL ではない）
 */
export function generateTestLinkPreview(settings: AffiliateSettings, sampleProductUrl: string): string {
  if (!settings.enabled || !settings.affiliateId) {
    return `（アフィリエイトID 未設定 → ${sampleProductUrl}）`;
  }
  return buildAffiliateUrl({
    shopCode: settings.shopCode,
    productUrl: sampleProductUrl,
    affiliateId: settings.affiliateId,
    linkTemplate: settings.linkTemplate || undefined,
    trackingParams: settings.trackingParams,
  });
}
