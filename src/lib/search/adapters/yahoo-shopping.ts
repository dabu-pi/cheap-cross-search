/**
 * Yahoo!ショッピング商品検索APIアダプタ (Phase 22)
 *
 * Yahoo!ショッピング商品検索 WebAPI V3 を使用して実商品データを取得する。
 *
 * 必要な環境変数:
 *   YAHOO_APP_ID  — Yahoo!デベロッパーアプリ ID（サーバーサイド専用・commit 禁止）
 *
 * APIキー取得:
 *   https://developer.yahoo.co.jp/webapi/shopping/
 *   Yahoo! JAPAN IDでアプリ登録後、即日発行される（無料）。
 *
 * 動作:
 *   - YAHOO_APP_ID が設定されている: Yahoo! API で実商品を取得
 *   - YAHOO_APP_ID が未設定: link_only にフォールバック（警告付き）
 *
 * 規約上の制約:
 *   - 価格表示: 取得時点の価格のみ可（長期キャッシュ禁止）
 *   - PR 表記: アフィリエイトリンク使用時は開示必須（既存免責バナーで対応済み）
 *   - 商品画像ホスト: item-shopping.c.yimg.jp / s.yimg.jp
 *
 * @see https://developer.yahoo.co.jp/webapi/shopping/shopping/v3/itemsearch.html
 */

import type { SearchAdapter, SearchAdapterInput, ShopSearchResult, ProductOffer } from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

// ─── Yahoo! API レスポンス型（最小限） ───────────────────────────────────

interface YahooSearchResponse {
  totalResultsAvailable: number;
  totalResultsReturned: number;
  hits: Array<{
    name: string;
    url: string;
    price: number;
    image?: {
      small?: string;
      medium?: string;
    };
    shipping?: {
      code: number;   // 1=送料無料, 0=送料あり
      name: string;
    };
    review?: {
      count: number;
      rate: number;
    };
    seller?: {
      name: string;
    };
    priceLabel?: {
      taxIncluded: boolean;
    };
  }>;
  Error?: Array<{ Message?: string }>;
}

// ─── アダプタ本体 ──────────────────────────────────────────────────────────

export class YahooShoppingAdapter implements SearchAdapter {
  readonly shopCode = 'yahoo';
  readonly mode = 'official_api' as const;

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    const shop = getShopByCode(this.shopCode);
    const now = new Date().toISOString();
    const searchUrl = shop ? buildSearchUrl(shop, input.query) : '';

    const appId = process.env.YAHOO_APP_ID;

    if (!appId) {
      // APIキー未設定 → link_only フォールバック
      return {
        shopCode: this.shopCode,
        shopName: shop?.name ?? 'Yahoo!ショッピング',
        status: 'link_only',
        integrationMode: 'official_api',
        searchUrl,
        offers: [],
        fetchedAt: now,
        warnings: [
          '[yahoo] YAHOO_APP_ID が未設定です。Yahoo!デベロッパーセンター（https://developer.yahoo.co.jp/）でAPIキーを取得後、環境変数に設定してください。',
        ],
      };
    }

    try {
      const params = new URLSearchParams({
        appid: appId,
        query: input.query,
        results: String(Math.min(input.maxResults ?? 8, 50)),
        sort: '-score',
        image_size: '140',
      });

      const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?${params}`;

      const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(input.timeoutMs ?? 8000),
      });

      if (!res.ok) {
        throw new Error(`Yahoo! Shopping API HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as YahooSearchResponse;

      if (data.Error && data.Error.length > 0) {
        throw new Error(`Yahoo! API error: ${data.Error[0]?.Message ?? 'unknown'}`);
      }

      const offers: ProductOffer[] = (data.hits ?? []).slice(0, input.maxResults ?? 8).map(
        (hit, idx) => {
          const shippingFree = hit.shipping?.code === 1;
          return {
            id: `yahoo-${hit.url.replace(/[^a-zA-Z0-9]/g, '').slice(-20)}-${idx}`,
            shopCode: 'yahoo',
            shopName: 'Yahoo!ショッピング',
            title: hit.name,
            imageUrl: hit.image?.medium ?? hit.image?.small,
            productUrl: hit.url,
            affiliateUrl: undefined,  // ValueCommerce 登録後に追加
            itemPrice: hit.price,
            shippingPrice: shippingFree ? 0 : undefined,
            estimatedTotalPrice: shippingFree ? hit.price : undefined,
            currency: 'JPY',
            taxIncludedStatus: 'included' as const,
            deliveryEstimateText: undefined,
            rating: hit.review?.rate ? Number(hit.review.rate.toFixed(1)) : undefined,
            reviewCount: hit.review?.count ?? undefined,
            priceConfidence: 'high' as const,
            fetchedAt: now,
            source: 'yahoo_api',
            isSearchPage: false,     // 商品詳細ページへの直接リンク
            isSponsored: false,
          };
        }
      );

      return {
        shopCode: this.shopCode,
        shopName: 'Yahoo!ショッピング',
        status: 'success',
        integrationMode: 'official_api',
        searchUrl,
        offers,
        fetchedAt: now,
        warnings:
          offers.length === 0
            ? [`Yahoo!ショッピング「${input.query}」: 0件でした`]
            : undefined,
      };
    } catch (err) {
      const msg = String(err);
      return {
        shopCode: this.shopCode,
        shopName: shop?.name ?? 'Yahoo!ショッピング',
        status: 'error',
        integrationMode: 'official_api',
        searchUrl,
        offers: [],
        errorMessage: msg,
        fetchedAt: now,
        warnings: [`[yahoo] API エラー: ${msg}`],
      };
    }
  }
}
