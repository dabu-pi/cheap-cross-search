import { SearchAdapter, SearchAdapterInput, ShopSearchResult, ProductOffer } from './types';
import { buildSearchUrl, getShopByCode } from '@/lib/shops/shops';

/**
 * external_api モック アダプタ (Phase 5)
 *
 * 本格的な外部 API 接続（TKAPI 等）実装前のモックアダプタ。
 * - source: 'external_api_mock' でデモデータと識別可能
 * - warnings に「デモデータ」であることを明記
 * - 将来、本物の外部 API アダプタに差し替えるための参照実装
 *
 * 差し替え手順（Phase 5以降）:
 * 1. `src/lib/search/adapters/external-api-{shopCode}.ts` を新規作成
 * 2. registry.ts で 'external_api' ケースに新アダプタを登録
 * 3. shops.ts / 管理画面で integrationMode を 'external_api' に変更
 * 4. このファイルは不要になったら削除またはアーカイブ
 *
 * @see registry.ts
 */
export class ExternalMockAdapter implements SearchAdapter {
  readonly mode = 'external_api' as const;

  constructor(public shopCode: string) {}

  async search(input: SearchAdapterInput): Promise<ShopSearchResult> {
    const shop = getShopByCode(this.shopCode);
    const now = new Date().toISOString();
    const searchUrl = shop ? buildSearchUrl(shop, input.query) : '';

    if (!shop) {
      return {
        shopCode: this.shopCode,
        shopName: this.shopCode,
        status: 'error',
        integrationMode: 'external_api',
        searchUrl: '',
        offers: [],
        errorMessage: 'ショップ定義が見つかりません',
        fetchedAt: now,
        warnings: ['ショップ定義が見つかりません'],
      };
    }

    // モックオファーを生成（クエリに応じたタイトルを付与）
    const offers = getMockOffersForShop(this.shopCode, input.query, now);

    return {
      shopCode: shop.code,
      shopName: shop.name,
      status: 'success',
      integrationMode: 'external_api',
      searchUrl,
      offers,
      fetchedAt: now,
      warnings: [
        'デモデータ表示中: 本格 API 接続前のモックデータです。実際の商品・価格と異なります。',
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────
// ショップ別モックオファー生成
// ─────────────────────────────────────────────────────────────

function getMockOffersForShop(
  shopCode: string,
  query: string,
  fetchedAt: string
): ProductOffer[] {
  const q = query.trim() || '商品';

  const templates: Record<string, ProductOffer[]> = {
    amazon: [
      {
        id: `mock-amazon-1-${Date.now()}`,
        shopCode: 'amazon',
        shopName: 'Amazon',
        title: `${q} 耐衝撃 クリア TPU 薄型 四隅補強 [国内メーカー]`,
        productUrl: 'https://www.amazon.co.jp',
        itemPrice: 1280,
        shippingPrice: 0,
        estimatedTotalPrice: 1280,
        currency: 'JPY',
        taxIncludedStatus: 'included',
        deliveryEstimateText: '翌日配送',
        rating: 4.2,
        reviewCount: 1234,
        priceConfidence: 'medium',
        fetchedAt,
        source: 'external_api_mock',
        isSponsored: false,
      },
      {
        id: `mock-amazon-2-${Date.now()}`,
        shopCode: 'amazon',
        shopName: 'Amazon',
        title: `${q} 手帳型 PUレザー カード収納 マグネット付き`,
        productUrl: 'https://www.amazon.co.jp',
        itemPrice: 2480,
        shippingPrice: 0,
        estimatedTotalPrice: 2480,
        currency: 'JPY',
        taxIncludedStatus: 'included',
        deliveryEstimateText: '翌日〜2日',
        rating: 4.5,
        reviewCount: 2341,
        priceConfidence: 'medium',
        fetchedAt,
        source: 'external_api_mock',
        isSponsored: false,
      },
    ],
    shein: [
      {
        id: `mock-shein-1-${Date.now()}`,
        shopCode: 'shein',
        shopName: 'SHEIN',
        title: `${q} ファッション フラワー柄 シリコン おしゃれ`,
        productUrl: 'https://jp.shein.com',
        itemPrice: 450,
        shippingPrice: undefined,
        estimatedTotalPrice: undefined,
        currency: 'JPY',
        taxIncludedStatus: 'unknown',
        deliveryEstimateText: '5〜10日',
        rating: 4.1,
        reviewCount: 567,
        priceConfidence: 'low',
        fetchedAt,
        source: 'external_api_mock',
        isSponsored: false,
      },
    ],
    aliexpress: [
      {
        id: `mock-aliexpress-1-${Date.now()}`,
        shopCode: 'aliexpress',
        shopName: 'AliExpress',
        title: `${q} 格安 衝撃吸収 クリア 4色展開 多機種対応`,
        productUrl: 'https://ja.aliexpress.com',
        itemPrice: 380,
        shippingPrice: 200,
        estimatedTotalPrice: 580,
        currency: 'JPY',
        taxIncludedStatus: 'excluded',
        deliveryEstimateText: '2〜4週間',
        rating: 3.8,
        reviewCount: 1560,
        priceConfidence: 'low',
        fetchedAt,
        source: 'external_api_mock',
        isSponsored: false,
      },
    ],
    temu: [
      {
        id: `mock-temu-1-${Date.now()}`,
        shopCode: 'temu',
        shopName: 'Temu',
        title: `${q} 超格安 保護フィルム付きセット ソフトシリコン`,
        productUrl: 'https://www.temu.com',
        itemPrice: 280,
        shippingPrice: undefined,
        estimatedTotalPrice: undefined,
        currency: 'JPY',
        taxIncludedStatus: 'unknown',
        deliveryEstimateText: undefined,
        rating: undefined,
        reviewCount: undefined,
        priceConfidence: 'unknown',
        fetchedAt,
        source: 'external_api_mock',
        isSponsored: false,
      },
    ],
  };

  return templates[shopCode] ?? [];
}
