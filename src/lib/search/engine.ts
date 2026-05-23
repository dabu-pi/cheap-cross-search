import { CrossSearchResult, ShopSearchResult, SearchAdapterInput } from './adapters/types';
import { getAdapter } from './adapters/registry';
import { getEnabledShops, SHOPS } from '@/lib/shops/shops';

/**
 * 横断検索エンジン (Phase 5 更新)
 *
 * ショップごとに registry からアダプタを選択して並列検索を実行。
 *
 * フォールバック方針:
 * - Promise が reject した場合は自動的に error 結果でラップ（全体が止まらない）
 * - official_api / affiliate_api が未実装のショップは link_only に安全フォールバック
 * - disabled ショップは検索対象から除外（disabled 結果として含まれる）
 *
 * 管理画面との連携（将来 Supabase 設定後）:
 * - 現在は shops.ts の静的設定を使用
 * - 将来: Supabase の shop_integrations テーブルから integrationMode を動的に取得
 * - Supabase 未設定時は shops.ts をフォールバックとして使用
 */
export async function crossSearch(query: string): Promise<CrossSearchResult> {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');

  // 有効（enabled かつ disabled でない）ショップ + disabled ショップ両方を処理
  // disabled ショップも結果に含めることで UI 側でステータス表示できる
  const allShops = SHOPS;
  const globalWarnings: string[] = [];

  const input: SearchAdapterInput = {
    query,
    normalizedQuery,
    locale: 'ja',
    currency: 'JPY',
    maxResults: 10,
    timeoutMs: 10000,
  };

  const results = await Promise.allSettled(
    allShops.map(async (shop): Promise<ShopSearchResult> => {
      if (!shop.enabled) {
        // enabled=false のショップ: disabled 扱い
        return {
          shopCode: shop.code,
          shopName: shop.name,
          status: 'disabled',
          integrationMode: 'disabled',
          searchUrl: '',
          offers: [],
          fetchedAt: new Date().toISOString(),
          warnings: ['このショップは現在無効化されています'],
        };
      }

      const shopFallbackWarnings: string[] = [];
      const adapter = getAdapter(shop.code, shop.integrationMode, shopFallbackWarnings);
      const result = await adapter.search(input);

      // フォールバック警告をグローバルにも集約
      if (shopFallbackWarnings.length > 0) {
        globalWarnings.push(...shopFallbackWarnings);
      }

      // requestedMode の付与（フォールバック発生時）
      const actualMode = result.integrationMode;
      const requestedMode =
        shopFallbackWarnings.length > 0 ? shop.integrationMode : undefined;

      return {
        ...result,
        warnings: [
          ...(result.warnings ?? []),
          ...shopFallbackWarnings,
        ],
        requestedMode,
        // フォールバックで link_only になっている場合でも元の integrationMode を保持
        integrationMode: actualMode,
      };
    })
  );

  const shopResults: ShopSearchResult[] = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Promise が reject した場合のフォールバック
    const errorMsg = String(result.reason);
    globalWarnings.push(`[${allShops[i].code}] 予期しないエラー: ${errorMsg}`);
    return {
      shopCode: allShops[i].code,
      shopName: allShops[i].name,
      status: 'error' as const,
      integrationMode: 'link_only' as const,
      searchUrl: '',
      offers: [],
      errorMessage: errorMsg,
      fetchedAt: new Date().toISOString(),
      warnings: [`予期しないエラーが発生しました: ${errorMsg}`],
    };
  });

  // 全ショップからオファーを集約
  const allOffers = shopResults.flatMap((s) => s.offers);

  // デモデータ使用中の全体警告
  const hasExternalMock = allOffers.some((o) => o.source === 'external_api_mock');
  if (hasExternalMock) {
    globalWarnings.unshift(
      'サンプル表示中: 現在表示している商品・価格はデモデータです。実際の商品ではありません。'
    );
  }

  return {
    query,
    normalizedQuery,
    searchedAt: new Date().toISOString(),
    shops: shopResults,
    offers: allOffers,
    globalWarnings: globalWarnings.length > 0 ? globalWarnings : undefined,
  };
}

/**
 * 有効ショップの検索のみ実行する軽量版（link_only除く）
 * Phase 1 互換用・レガシーコードからの移行パス
 */
export async function crossSearchEnabled(query: string): Promise<CrossSearchResult> {
  const enabledShops = getEnabledShops();
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');
  const globalWarnings: string[] = [];

  const input: SearchAdapterInput = {
    query,
    normalizedQuery,
    locale: 'ja',
    currency: 'JPY',
    maxResults: 10,
    timeoutMs: 10000,
  };

  const results = await Promise.allSettled(
    enabledShops.map(async (shop): Promise<ShopSearchResult> => {
      const shopFallbackWarnings: string[] = [];
      const adapter = getAdapter(shop.code, shop.integrationMode, shopFallbackWarnings);
      if (shopFallbackWarnings.length > 0) {
        globalWarnings.push(...shopFallbackWarnings);
      }
      const result = await adapter.search(input);
      return {
        ...result,
        warnings: [...(result.warnings ?? []), ...shopFallbackWarnings],
        requestedMode: shopFallbackWarnings.length > 0 ? shop.integrationMode : undefined,
      };
    })
  );

  const shopResults: ShopSearchResult[] = results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    return {
      shopCode: enabledShops[i].code,
      shopName: enabledShops[i].name,
      status: 'error' as const,
      integrationMode: 'link_only' as const,
      searchUrl: '',
      offers: [],
      errorMessage: String(result.reason),
      fetchedAt: new Date().toISOString(),
    };
  });

  const allOffers = shopResults.flatMap((s) => s.offers);

  return {
    query,
    normalizedQuery,
    searchedAt: new Date().toISOString(),
    shops: shopResults,
    offers: allOffers,
    globalWarnings: globalWarnings.length > 0 ? globalWarnings : undefined,
  };
}
