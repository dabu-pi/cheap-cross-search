import { CrossSearchResult, ShopSearchResult } from './adapters/types';
import { LinkOnlyAdapter } from './adapters/link-only';
import { getEnabledShops } from '@/lib/shops/shops';

/**
 * 検索エンジン
 * ショップごとに適切なアダプタを選択して検索を実行する
 *
 * 将来的な拡張:
 * - official_api  → OfficialApiAdapter
 * - affiliate_api → AffiliateApiAdapter
 * - external_api  → ExternalApiAdapter
 * - link_only     → LinkOnlyAdapter (現在唯一の実装)
 * - disabled      → スキップ
 */
export async function crossSearch(query: string): Promise<CrossSearchResult> {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');
  const shops = getEnabledShops();

  const results = await Promise.allSettled(
    shops.map(async (shop): Promise<ShopSearchResult> => {
      // 将来: integrationMode に応じてアダプタを切り替える
      // 現在はすべて LinkOnlyAdapter
      const adapter = new LinkOnlyAdapter(shop.code);
      return adapter.search(normalizedQuery);
    })
  );

  const shopResults: ShopSearchResult[] = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Promise が reject した場合のフォールバック
    return {
      shopCode: shops[i].code,
      shopName: shops[i].name,
      status: 'error' as const,
      integrationMode: 'link_only' as const,
      searchUrl: '',
      offers: [],
      errorMessage: String(result.reason),
      fetchedAt: new Date().toISOString(),
    };
  });

  return {
    query,
    normalizedQuery,
    searchedAt: new Date().toISOString(),
    shops: shopResults,
  };
}
