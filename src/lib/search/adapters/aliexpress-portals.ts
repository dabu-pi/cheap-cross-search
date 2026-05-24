/**
 * AliExpress Portals アダプタ (Phase 17 スタブ — 将来実装)
 *
 * ─── 現状 (2026-05-24 時点) ───────────────────────────────────────────────
 * AliExpress Portals 申請済み（2026-05-23 22:16 PST）。
 * 承認メール待ち。承認後に API キー (App Key / App Secret) が発行される。
 *
 * ─── 承認後の実装手順 ─────────────────────────────────────────────────────
 * 1. AliExpress Portals ダッシュボードで API キーを取得
 *    URL: https://portals.aliexpress.com/
 *
 * 2. .env.local に追加（commit しない）:
 *      ALIEXPRESS_PORTALS_APP_KEY=...
 *      ALIEXPRESS_PORTALS_APP_SECRET=...
 *    Vercel にも同じ env を追加（Dashboard → Settings → Environment Variables）
 *
 * 3. shops.ts の aliexpress.integrationMode を 'affiliate_api' に変更:
 *      integrationMode: 'affiliate_api',
 *
 * 4. registry.ts の case 'affiliate_api' に本アダプタを登録:
 *      // このコメントを外す:
 *      if (shopCode === 'aliexpress') return new AliExpressPortalsAdapter();
 *
 * 5. このファイルの search() メソッド内の TODO 部分に実装を追加
 *
 * 6. live-check で動作確認
 *
 * ─── AliExpress Portals API 概要 ──────────────────────────────────────────
 * - Endpoint: https://api-sg.aliexpress.com/sync
 * - Method: aliexpress.affiliate.product.query
 * - Parameters: keywords, category_ids, page_size, page_no 等
 * - 返却: product_id, product_title, target_sale_price (JPY), product_main_image_url,
 *          promotion_link (アフィリエイトリンク) 等
 * - 価格信頼度: medium（Portals 経由の参考価格）
 * - 通貨: target_currency=JPY で日本円返却可能
 * - ドキュメント: https://developers.aliexpress.com/en/doc.htm?docId=45170&docType=2
 *
 * ─── 注意事項 ────────────────────────────────────────────────────────────
 * - 価格は参考値（fluctuation あり）。productUrl を検索ページに fallback しておく。
 * - 画像は AliExpress CDN の URL を返す。表示前に Next.js Image の domains に追加が必要。
 * - promotion_link がアフィリエイトリンク（クリック計測済み）。/api/click 経由不要の可能性あり。
 *
 * @see docs/ADAPTER_DEVELOPMENT_GUIDE.md
 * @see docs/API_AFFILIATE_RESEARCH.md
 * @see registry.ts
 */

import type { SearchAdapter, SearchAdapterInput, ShopSearchResult } from './types';
import { LinkOnlyAdapter } from './link-only';

/**
 * AliExpress Portals アダプタ
 *
 * ⚠️ 現在は Portals 承認待ちのため search() は link_only フォールバックを返す。
 *    承認後は TODO セクションに実装を追加して registry.ts に登録すること。
 */
export class AliExpressPortalsAdapter implements SearchAdapter {
  readonly shopCode = 'aliexpress';
  readonly mode = 'affiliate_api' as const;

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    // ── TODO: Portals 承認後にここに実装 ───────────────────────────────
    //
    // const appKey = process.env.ALIEXPRESS_PORTALS_APP_KEY;
    // const appSecret = process.env.ALIEXPRESS_PORTALS_APP_SECRET;
    //
    // if (!appKey || !appSecret) {
    //   return this._fallback(input, 'AliExpress Portals API キーが未設定です');
    // }
    //
    // const products = await queryAliExpressProducts({
    //   keywords: input.query,
    //   appKey, appSecret,
    //   targetCurrency: 'JPY',
    //   targetLanguage: 'JA',
    //   pageSize: input.maxResults ?? 10,
    // });
    //
    // return {
    //   shopCode: 'aliexpress',
    //   shopName: 'AliExpress',
    //   status: 'success',
    //   integrationMode: 'affiliate_api',
    //   searchUrl: `https://ja.aliexpress.com/wholesale?SearchText=${encodeURIComponent(input.query)}`,
    //   offers: products.map(toProductOffer),
    //   fetchedAt: new Date().toISOString(),
    // };
    //
    // ────────────────────────────────────────────────────────────────────

    return this._fallback(input, 'AliExpress Portals は承認待ちです（申請済み 2026-05-23）');
  }

  /** link_only フォールバックを返すヘルパー */
  private async _fallback(
    input: SearchAdapterInput,
    reason: string
  ): Promise<ShopSearchResult> {
    const result = await new LinkOnlyAdapter('aliexpress').search(input);
    return {
      ...result,
      requestedMode: 'affiliate_api',
      warnings: [reason, ...(result.warnings ?? [])],
    };
  }
}
