/**
 * 楽天市場商品検索APIアダプタ (Phase 22)
 *
 * 楽天ウェブサービス 商品検索API 20220601 を使用して実商品データを取得する。
 *
 * 必要な環境変数:
 *   RAKUTEN_APP_ID  — 楽天ウェブサービス applicationId（サーバーサイド専用・commit 禁止）
 *
 * APIキー取得:
 *   https://webservice.rakuten.co.jp/
 *   楽天IDで登録後、アプリ登録すると即日発行される（無料）。
 *
 * 動作:
 *   - RAKUTEN_APP_ID が設定されている: 楽天API で実商品を取得
 *   - RAKUTEN_APP_ID が未設定: link_only にフォールバック（警告付き）
 *
 * 規約上の制約:
 *   - 価格・在庫データの長期保存禁止（リアルタイム表示のみ）
 *   - 商品画像は thumbnail.image.rakuten.co.jp / shop.r10s.jp 等から取得
 *   - PR（アフィリエイト）表記が必要（既存の免責バナーで対応済み）
 *
 * @see https://webservice.rakuten.co.jp/documentation/ichiba-item-search
 */

import type { SearchAdapter, SearchAdapterInput, ShopSearchResult, ProductOffer } from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

// ─── 楽天 API レスポンス型（最小限） ─────────────────────────────────────

interface RakutenSearchResponse {
  count: number;
  page: number;
  Items: Array<{
    Item: {
      itemName: string;
      itemCode: string;
      itemPrice: number;
      itemUrl: string;
      mediumImageUrls: Array<{ imageUrl: string }>;
      postageFlag: number;       // 0=送料あり 1=送料無料
      shopName: string;
      reviewAverage: number;
      reviewCount: number;
      availability: number;      // 1=在庫あり
    };
  }>;
  error?: string;
  error_description?: string;
}

// ─── アダプタ本体 ──────────────────────────────────────────────────────────

export class RakutenIchibaAdapter implements SearchAdapter {
  readonly shopCode = 'rakuten';
  readonly mode = 'official_api' as const;

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    const shop = getShopByCode(this.shopCode);
    const now = new Date().toISOString();
    const searchUrl = shop ? buildSearchUrl(shop, input.query) : '';

    const appId = process.env.RAKUTEN_APP_ID;

    if (!appId) {
      // APIキー未設定 → link_only フォールバック
      return {
        shopCode: this.shopCode,
        shopName: shop?.name ?? '楽天市場',
        status: 'link_only',
        integrationMode: 'official_api',
        searchUrl,
        offers: [],
        fetchedAt: now,
        warnings: [
          '[rakuten] RAKUTEN_APP_ID が未設定です。楽天ウェブサービス（https://webservice.rakuten.co.jp/）でAPIキーを取得後、環境変数に設定してください。',
        ],
      };
    }

    try {
      const params = new URLSearchParams({
        applicationId: appId,
        keyword: input.query,
        hits: String(Math.min(input.maxResults ?? 8, 30)),
        imageFlag: '1',
        sort: 'standard',
        format: 'json',
      });

      const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`;

      const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(input.timeoutMs ?? 8000),
      });

      if (!res.ok) {
        throw new Error(`Rakuten API HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as RakutenSearchResponse;

      if (data.error) {
        throw new Error(`Rakuten API error: ${data.error} — ${data.error_description ?? ''}`);
      }

      const offers: ProductOffer[] = (data.Items ?? []).slice(0, input.maxResults ?? 8).map(
        ({ Item: item }, idx) => ({
          id: `rakuten-${item.itemCode.replace(/[^a-zA-Z0-9]/g, '').slice(-16)}-${idx}`,
          shopCode: 'rakuten',
          shopName: '楽天市場',
          externalProductId: item.itemCode,
          title: item.itemName,
          imageUrl: item.mediumImageUrls?.[0]?.imageUrl,
          productUrl: item.itemUrl,
          affiliateUrl: undefined, // 楽天アフィリエイト登録後に追加
          itemPrice: item.itemPrice,
          shippingPrice: item.postageFlag === 1 ? 0 : undefined,
          estimatedTotalPrice: item.postageFlag === 1 ? item.itemPrice : undefined,
          currency: 'JPY',
          taxIncludedStatus: 'included' as const,
          deliveryEstimateText: undefined,
          rating: item.reviewAverage > 0 ? item.reviewAverage : undefined,
          reviewCount: item.reviewCount > 0 ? item.reviewCount : undefined,
          priceConfidence: 'high' as const,
          fetchedAt: now,
          source: 'rakuten_api',
          isSearchPage: false,     // 商品詳細ページへの直接リンク
          isSponsored: false,
        })
      );

      return {
        shopCode: this.shopCode,
        shopName: '楽天市場',
        status: 'success',
        integrationMode: 'official_api',
        searchUrl,
        offers,
        fetchedAt: now,
        warnings:
          offers.length === 0
            ? [`楽天市場「${input.query}」: 0件でした`]
            : undefined,
      };
    } catch (err) {
      const msg = String(err);
      return {
        shopCode: this.shopCode,
        shopName: shop?.name ?? '楽天市場',
        status: 'error',
        integrationMode: 'official_api',
        searchUrl,
        offers: [],
        errorMessage: msg,
        fetchedAt: now,
        warnings: [`[rakuten] API エラー: ${msg}`],
      };
    }
  }
}
