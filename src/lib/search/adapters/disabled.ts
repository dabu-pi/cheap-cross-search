import { SearchAdapter, SearchAdapterInput, ShopSearchResult } from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

/**
 * disabled アダプタ (Phase 5)
 *
 * ショップが一時停止中の場合に使用。
 * - status: 'disabled' を返す
 * - offers は空
 * - searchUrl は検索リンク（将来の再有効化時に使う）
 */
export class DisabledAdapter implements SearchAdapter {
  readonly mode = 'disabled' as const;

  constructor(public shopCode: string) {}

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    const shop = getShopByCode(this.shopCode);
    const now = new Date().toISOString();
    const searchUrl = shop ? buildSearchUrl(shop, input.query) : '';

    return {
      shopCode: this.shopCode,
      shopName: shop?.name ?? this.shopCode,
      status: 'disabled',
      integrationMode: 'disabled',
      searchUrl,
      offers: [],
      fetchedAt: now,
      warnings: ['このショップは現在一時停止中です'],
    };
  }
}
