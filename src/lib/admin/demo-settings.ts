/**
 * 管理画面デモ設定データ (Phase 4)
 *
 * 本番 Supabase 接続前の開発プレビュー用。
 * Supabase 設定後は DB から取得するよう置き換える。
 */

import { SHOPS } from '@/lib/shops/shops';
import type { ShopAdminConfig, AffiliateConfig } from './types';

// ─────────────────────────────────────────────────────────────
// ショップ管理デモ設定
// ─────────────────────────────────────────────────────────────

export function getDemoShopAdminConfigs(): ShopAdminConfig[] {
  return SHOPS.map((shop) => ({
    shopCode: shop.code,
    shopName: shop.name,
    enabled: shop.enabled,
    displayOrder: shop.displayOrder,
    integrationMode: shop.integrationMode,
    searchUrlTemplate: shop.searchUrlTemplate,
    baseUrl: shop.baseUrl,
    apiStatus: 'not_configured' as const,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
    notes: '',
  }));
}

// ─────────────────────────────────────────────────────────────
// アフィリエイト設定デモデータ
// ─────────────────────────────────────────────────────────────

export function getDemoAffiliateConfigs(): AffiliateConfig[] {
  return [
    {
      shopCode: 'amazon',
      shopName: 'Amazon',
      enabled: false,
      affiliateId: '',
      linkTemplate: 'https://www.amazon.co.jp/dp/{asin}?tag={affiliate_id}',
      priceDisplayAllowed: true,
      imageDisplayAllowed: true,
      cacheMinutes: 60,
      notes: 'Amazon アソシエイトID を設定すること。PA-API 利用には審査が必要。',
    },
    {
      shopCode: 'shein',
      shopName: 'SHEIN',
      enabled: false,
      affiliateId: '',
      linkTemplate: 'https://jp.shein.com/product/{product_id}.html?ref={affiliate_id}',
      priceDisplayAllowed: true,
      imageDisplayAllowed: true,
      cacheMinutes: 120,
      notes: 'SHEIN アフィリエイトプログラムへの参加が必要。',
    },
    {
      shopCode: 'aliexpress',
      shopName: 'AliExpress',
      enabled: false,
      affiliateId: '',
      linkTemplate: 'https://s.click.aliexpress.com/e/{tracking_id}',
      priceDisplayAllowed: true,
      imageDisplayAllowed: true,
      cacheMinutes: 180,
      notes: 'AliExpress Affiliate Program への申請が必要。',
    },
    {
      shopCode: 'temu',
      shopName: 'Temu',
      enabled: false,
      affiliateId: '',
      linkTemplate: 'https://www.temu.com/ul/...?refer_page_name=affiliate&refer_source={affiliate_id}',
      priceDisplayAllowed: true,
      imageDisplayAllowed: false,
      cacheMinutes: 240,
      notes: 'Temu アフィリエイト申請が必要。画像利用条件は要確認。',
    },
  ];
}
