/**
 * 楽天市場商品検索APIアダプタ (Phase 22 / Phase 23C 更新)
 *
 * 楽天市場商品検索API version 2026-04-01（openapi.rakuten.co.jp プラットフォーム）を使用する。
 *
 * 必要な環境変数（いずれもサーバーサイド専用・commit 禁止）:
 *   RAKUTEN_APP_ID       — アプリケーションID（applicationId）【必須】
 *   RAKUTEN_ACCESS_KEY   — アクセスキー（accessKey）【必須・2026-04-01 仕様で追加】
 *   RAKUTEN_AFFILIATE_ID — アフィリエイトID（affiliateId）【任意】
 *
 * APIキー取得:
 *   楽天 Developers / Rakuten Web Service のアプリ一覧で
 *   「アプリケーションID」「アクセスキー」「アフィリエイトID」を確認する。
 *
 * 2026-04-01 仕様の要点:
 *   - endpoint: https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401
 *   - applicationId と accessKey の両方が必須（accessKey はクエリ or ヘッダで渡す）
 *   - affiliateId は任意（設定すると affiliateUrl が返る）
 *   - formatVersion=2 で items 配列が扱いやすい形式（items[].itemName 等・フラット）
 *   - mediumImageUrls は文字列 URL の配列（128x128）
 *   - エラーは {"errors":{"errorCode":N,"errorMessage":"..."}} 形式
 *
 * 動作:
 *   - applicationId と accessKey が揃っている: 楽天API で実商品を取得
 *   - いずれか未設定 / API エラー: link_only にフォールバック（UI にエラーを漏らさない）
 *
 * 規約上の制約:
 *   - 価格・在庫データの長期保存禁止（リアルタイム表示のみ）
 *   - PR（アフィリエイト）表記が必要（既存の免責バナーで対応済み）
 *
 * @see https://webservice.rakuten.co.jp/documentation/ichiba-item-search
 */

import type { SearchAdapter, SearchAdapterInput, ShopSearchResult, ProductOffer } from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

const RAKUTEN_ENDPOINT =
  'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401';

// ─── 楽天 API レスポンス型（formatVersion=2 / 後方互換も許容） ───────────────

/** formatVersion=2 のアイテム（フィールドが配列要素直下にフラットに並ぶ） */
interface RakutenItemFlat {
  itemName?: string;
  itemCode?: string;
  itemPrice?: number;
  itemUrl?: string;
  affiliateUrl?: string;
  /** v2 は文字列URLの配列 / 旧形式は {imageUrl} の配列 */
  mediumImageUrls?: Array<string | { imageUrl: string }>;
  postageFlag?: number; // 0=送料別 1=送料込み
  shopName?: string;
  reviewAverage?: number;
  reviewCount?: number;
  availability?: number; // 1=在庫あり
}

/** 旧形式（formatVersion=1）の入れ子 */
interface RakutenItemNested {
  Item: RakutenItemFlat;
}

interface RakutenSearchResponse {
  count?: number;
  page?: number;
  /** v2: lowercase items（フラット）/ 旧: Items（入れ子）の両方を許容 */
  items?: RakutenItemFlat[];
  Items?: Array<RakutenItemNested | RakutenItemFlat>;
  /** 2026-04-01 のエラー形式 */
  errors?: { errorCode: number; errorMessage: string };
  /** 旧エラー形式 */
  error?: string;
  error_description?: string;
}

/** ログから secrets（applicationId / accessKey）を除去する */
function maskSecrets(s: string): string {
  return s
    .replace(/applicationId=[^&\s"]+/gi, 'applicationId=[MASKED]')
    .replace(/accessKey=[^&\s"]+/gi, 'accessKey=[MASKED]');
}

/** items 配列要素を v2 フラット形式へ正規化（旧入れ子も許容） */
function normalizeItem(entry: RakutenItemNested | RakutenItemFlat): RakutenItemFlat {
  return 'Item' in entry && entry.Item ? entry.Item : (entry as RakutenItemFlat);
}

/** mediumImageUrls から先頭画像URLを取り出す（文字列配列 / オブジェクト配列の両対応） */
function firstImageUrl(arr?: Array<string | { imageUrl: string }>): string | undefined {
  const first = arr?.[0];
  if (!first) return undefined;
  return typeof first === 'string' ? first : first.imageUrl;
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
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

    const linkOnly = (warnings: string[]): ShopSearchResult => ({
      shopCode: this.shopCode,
      shopName: shop?.name ?? '楽天市場',
      status: 'link_only',
      integrationMode: 'official_api',
      searchUrl,
      offers: [],
      fetchedAt: now,
      warnings,
    });

    if (!appId || !accessKey) {
      // 2026-04-01 仕様では applicationId と accessKey の両方が必須
      const missing = [
        !appId ? 'RAKUTEN_APP_ID(applicationId)' : null,
        !accessKey ? 'RAKUTEN_ACCESS_KEY(accessKey)' : null,
      ]
        .filter(Boolean)
        .join(' / ');
      return linkOnly([
        `[rakuten] ${missing} が未設定です。楽天 Developers / Rakuten Web Service のアプリ一覧で applicationId と accessKey を確認し、環境変数に設定してください。`,
      ]);
    }

    try {
      const params = new URLSearchParams({
        applicationId: appId,
        accessKey,
        keyword: input.query,
        hits: String(Math.min(input.maxResults ?? 8, 30)),
        imageFlag: '1',
        sort: 'standard',
        formatVersion: '2',
      });
      if (affiliateId) params.set('affiliateId', affiliateId);

      const url = `${RAKUTEN_ENDPOINT}?${params}`;

      const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(input.timeoutMs ?? 8000),
      });

      if (!res.ok) {
        // レスポンス本文（secrets を含まない）を読みつつ、念のため mask
        let body = '';
        try { body = await res.text(); } catch { /* ignore */ }
        const safeBody = maskSecrets(body.slice(0, 300));
        console.error(`[rakuten] API HTTP ${res.status} ${res.statusText}:`, safeBody);
        throw new Error(`Rakuten API HTTP ${res.status}: ${res.statusText} — ${safeBody}`);
      }

      const data = (await res.json()) as RakutenSearchResponse;

      // 2026-04-01 のエラー形式
      if (data.errors) {
        console.error('[rakuten] API error response:', data.errors.errorCode, data.errors.errorMessage);
        throw new Error(`Rakuten API error ${data.errors.errorCode}: ${data.errors.errorMessage}`);
      }
      // 旧エラー形式（後方互換）
      if (data.error) {
        console.error('[rakuten] API error response (legacy):', data.error, data.error_description ?? '');
        throw new Error(`Rakuten API error: ${data.error} — ${data.error_description ?? ''}`);
      }

      // v2: items（フラット）/ 旧: Items（入れ子）の両対応
      const rawItems: Array<RakutenItemNested | RakutenItemFlat> =
        data.items ?? data.Items ?? [];

      const max = input.maxResults ?? 8;
      const offers: ProductOffer[] = rawItems.slice(0, max).map((entry, idx) => {
        const item = normalizeItem(entry);
        const code = String(item.itemCode ?? '').replace(/[^a-zA-Z0-9]/g, '').slice(-16);
        return {
          id: `rakuten-${code || 'item'}-${idx}`,
          shopCode: 'rakuten',
          shopName: '楽天市場',
          externalProductId: item.itemCode,
          title: item.itemName ?? '',
          imageUrl: firstImageUrl(item.mediumImageUrls),
          productUrl: item.itemUrl ?? searchUrl,
          // affiliateId 設定時は楽天が affiliateUrl を返す
          affiliateUrl: item.affiliateUrl || undefined,
          itemPrice: item.itemPrice,
          shippingPrice: item.postageFlag === 1 ? 0 : undefined,
          estimatedTotalPrice: item.postageFlag === 1 ? item.itemPrice : undefined,
          currency: 'JPY',
          taxIncludedStatus: 'included' as const,
          deliveryEstimateText: undefined,
          rating: (item.reviewAverage ?? 0) > 0 ? item.reviewAverage : undefined,
          reviewCount: (item.reviewCount ?? 0) > 0 ? item.reviewCount : undefined,
          priceConfidence: 'high' as const,
          fetchedAt: now,
          source: 'rakuten_api',
          isSearchPage: false, // 商品詳細ページへの直接リンク
          isSponsored: false,
        };
      });

      return {
        shopCode: this.shopCode,
        shopName: '楽天市場',
        status: 'success',
        integrationMode: 'official_api',
        searchUrl,
        offers,
        fetchedAt: now,
        warnings:
          offers.length === 0 ? [`楽天市場「${input.query}」: 0件でした`] : undefined,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const safeMsg = maskSecrets(msg);
      console.error('[rakuten] API エラーのため外部検索フォールバック:', safeMsg);
      // ユーザー向けには link_only フォールバック（エラー表示しない）
      return linkOnly([`[rakuten] API エラーのため外部検索フォールバック: ${safeMsg}`]);
    }
  }
}
