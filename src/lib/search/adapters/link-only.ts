import {
  SearchAdapter,
  SearchAdapterOptions,
  ShopSearchResult,
} from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

/**
 * link_only アダプタ
 * 商品データは取得せず、各ショップの検索結果ページへのリンクのみ返す
 */
export class LinkOnlyAdapter implements SearchAdapter {
  constructor(public shopCode: string) {}

  async search(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: SearchAdapterOptions
  ): Promise<ShopSearchResult> {
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

    const searchUrl = buildSearchUrl(shop, query);

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
