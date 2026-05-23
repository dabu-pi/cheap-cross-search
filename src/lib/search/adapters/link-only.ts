import {
  SearchAdapter,
  SearchAdapterInput,
  ShopSearchResult,
} from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

/**
 * link_only アダプタ (Phase 5 更新)
 *
 * 商品データは取得せず、各ショップの検索結果ページへのリンクのみ返す。
 * - API 未設定時・API 障害時の最終フォールバックとして使用
 * - status: 'link_only' を返す
 */
export class LinkOnlyAdapter implements SearchAdapter {
  readonly mode = 'link_only' as const;

  constructor(public shopCode: string) {}

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    const shop = getShopByCode(this.shopCode);
    const now = new Date().toISOString();

    if (!shop) {
      return {
        shopCode: this.shopCode,
        shopName: this.shopCode,
        status: 'error',
        integrationMode: 'link_only',
        searchUrl: '',
        offers: [],
        errorMessage: 'ショップ定義が見つかりません',
        fetchedAt: now,
      };
    }

    const searchUrl = buildSearchUrl(shop, input.query);

    return {
      shopCode: shop.code,
      shopName: shop.name,
      status: 'link_only',
      integrationMode: 'link_only',
      searchUrl,
      offers: [],
      fetchedAt: now,
    };
  }
}
