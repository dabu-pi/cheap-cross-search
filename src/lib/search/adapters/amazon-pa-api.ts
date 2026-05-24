/**
 * Amazon PA-API アダプタ (Phase 17 スタブ — 将来実装)
 *
 * ─── 現状 (2026-05-24 時点) ───────────────────────────────────────────────
 * Amazon アソシエイト登録完了・アフィリエイト ID 設定済み（Supabase DB）。
 * PA-API (Product Advertising API v5) は **売上3件後に自動有効化**。
 * 有効化前は link_only にフォールバックする。
 *
 * ─── PA-API 有効化後の実装手順 ───────────────────────────────────────────
 * 1. AWS コンソールで PA-API アクセスキーを取得
 * 2. .env.local に追加（commit しない）:
 *      AWS_PA_API_ACCESS_KEY=AKIA...
 *      AWS_PA_API_SECRET_KEY=...
 *      AMAZON_ASSOCIATE_TAG=cheapc***-22
 *    Vercel にも同じ env を追加（Dashboard → Settings → Environment Variables）
 *
 * 3. shops.ts の amazon.integrationMode を 'official_api' に変更:
 *      integrationMode: 'official_api',
 *
 * 4. registry.ts の case 'official_api' に本アダプタを登録:
 *      // このコメントを外す:
 *      if (shopCode === 'amazon') return new AmazonPaApiAdapter();
 *
 * 5. このファイルの search() メソッド内の TODO 部分に実装を追加
 *
 * 6. live-check で動作確認
 *
 * ─── PA-API v5 概要 ───────────────────────────────────────────────────────
 * - Endpoint: https://webservices.amazon.co.jp/paapi5/searchitems
 * - Operation: SearchItems
 * - Parameters: Keywords, SearchIndex, Resources (ItemInfo, Offers 等)
 * - Rate limit: 1 req/sec (初期)。売上に応じて上昇。
 * - 価格信頼度: high（公式 API から直取得）
 * - ドキュメント: https://webservices.amazon.co.jp/paapi5/documentation/
 *
 * @see docs/ADAPTER_DEVELOPMENT_GUIDE.md
 * @see docs/API_AFFILIATE_RESEARCH.md
 * @see registry.ts
 */

import type { SearchAdapter, SearchAdapterInput, ShopSearchResult } from './types';
import { LinkOnlyAdapter } from './link-only';

/**
 * Amazon PA-API アダプタ
 *
 * ⚠️ 現在は PA-API 未有効化のため search() は link_only フォールバックを返す。
 *    有効化後は TODO セクションに実装を追加して registry.ts に登録すること。
 */
export class AmazonPaApiAdapter implements SearchAdapter {
  readonly shopCode = 'amazon';
  readonly mode = 'official_api' as const;

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    // ── TODO: PA-API 有効化後にここに実装 ──────────────────────────────
    //
    // const accessKey = process.env.AWS_PA_API_ACCESS_KEY;
    // const secretKey = process.env.AWS_PA_API_SECRET_KEY;
    // const associateTag = process.env.AMAZON_ASSOCIATE_TAG;
    //
    // if (!accessKey || !secretKey || !associateTag) {
    //   return this._fallback(input, 'PA-API 環境変数が未設定です');
    // }
    //
    // const items = await searchViaPA({
    //   keywords: input.query,
    //   marketplace: 'www.amazon.co.jp',
    //   accessKey, secretKey, associateTag,
    //   maxResults: input.maxResults ?? 10,
    // });
    //
    // return {
    //   shopCode: 'amazon',
    //   shopName: 'Amazon',
    //   status: 'success',
    //   integrationMode: 'official_api',
    //   searchUrl: `https://www.amazon.co.jp/s?k=${encodeURIComponent(input.query)}`,
    //   offers: items.map(toProductOffer),
    //   fetchedAt: new Date().toISOString(),
    // };
    //
    // ────────────────────────────────────────────────────────────────────

    return this._fallback(input, 'Amazon PA-API は売上3件後に有効化されます（現在準備中）');
  }

  /** link_only フォールバックを返すヘルパー */
  private async _fallback(
    input: SearchAdapterInput,
    reason: string
  ): Promise<ShopSearchResult> {
    const result = await new LinkOnlyAdapter('amazon').search(input);
    return {
      ...result,
      requestedMode: 'official_api',
      warnings: [reason, ...(result.warnings ?? [])],
    };
  }
}
