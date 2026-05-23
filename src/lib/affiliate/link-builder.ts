/**
 * アフィリエイトリンク生成ユーティリティ (Phase 6)
 *
 * ⚠️ 本番アフィリエイトID は絶対に Git に入れないこと。
 * affiliateId が空文字の場合は productUrl をそのまま返す（安全フォールバック）。
 */

import type { AffiliateLinkInput, AffiliateSettings } from './types';

/**
 * アフィリエイト URL を生成する。
 *
 * 生成ロジック（優先順）:
 * 1. affiliateId が空 → productUrl をそのまま返す
 * 2. linkTemplate がある → {product_url} / {affiliate_id} を置換
 * 3. trackingParams がある → URL クエリパラメータに追記
 * 4. いずれもない → productUrl をそのまま返す
 *
 * 不正な URL が生成された場合は productUrl にフォールバック。
 */
export function buildAffiliateUrl(input: AffiliateLinkInput): string {
  const { productUrl, affiliateId, linkTemplate, trackingParams } = input;

  // affiliateId が未設定 → パススルー
  if (!affiliateId) return productUrl;

  // テンプレート方式
  if (linkTemplate && linkTemplate.includes('{product_url}')) {
    try {
      const built = linkTemplate
        .replace('{product_url}', encodeURIComponent(productUrl))
        .replace('{affiliate_id}', encodeURIComponent(affiliateId));
      // 生成結果が有効な URL か検証
      new URL(built.startsWith('http') ? built : `https:${built}`);
      return built;
    } catch {
      return productUrl;
    }
  }

  // トラッキングパラメータ追記方式
  if (trackingParams && Object.keys(trackingParams).length > 0) {
    try {
      const url = new URL(productUrl);
      for (const [key, val] of Object.entries(trackingParams)) {
        const resolved = val.replace('{affiliate_id}', encodeURIComponent(affiliateId));
        url.searchParams.set(key, resolved);
      }
      return url.toString();
    } catch {
      return productUrl;
    }
  }

  // フォールバック: productUrl そのまま
  return productUrl;
}

/**
 * AffiliateSettings からアフィリエイト URL を生成する。
 * 設定が無効（enabled=false / affiliateId 空）の場合は productUrl を返す。
 */
export function buildAffiliateUrlFromSettings(
  productUrl: string,
  settings: AffiliateSettings | undefined | null
): string {
  if (!settings || !settings.enabled || !settings.affiliateId) {
    return productUrl;
  }
  return buildAffiliateUrl({
    shopCode: settings.shopCode,
    productUrl,
    affiliateId: settings.affiliateId,
    linkTemplate: settings.linkTemplate || undefined,
    trackingParams: settings.trackingParams,
  });
}

/**
 * /api/click 経由のクリック計測 URL を生成する。
 *
 * 形式: /api/click?shop={shopCode}&to={encodedUrl}[&offerId={id}][&q={query}]
 *
 * セキュリティ:
 * - to パラメータは /api/click/route.ts でホスト検証される
 * - 許可されていないホストへの redirect は拒否される
 */
export function buildClickTrackingUrl(
  destinationUrl: string,
  shopCode: string,
  offerId?: string,
  query?: string
): string {
  const params = new URLSearchParams({
    shop: shopCode,
    to: destinationUrl,
  });
  if (offerId) params.set('offerId', offerId);
  if (query) params.set('q', query);
  return `/api/click?${params.toString()}`;
}

/**
 * ProductOffer からクリック URL を生成する。
 * affiliateUrl があれば affiliateUrl 経由、なければ productUrl 経由。
 */
export function buildOfferClickUrl(
  offer: { affiliateUrl?: string; productUrl: string; shopCode: string; id: string },
  query?: string
): string {
  const destination = offer.affiliateUrl ?? offer.productUrl;
  return buildClickTrackingUrl(destination, offer.shopCode, offer.id, query);
}
