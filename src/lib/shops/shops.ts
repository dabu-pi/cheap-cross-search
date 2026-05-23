import { IntegrationMode } from '@/lib/search/adapters/types';

/**
 * ショップ定義
 */
export interface ShopDefinition {
  code: string;
  name: string;
  nameEn: string;
  baseUrl: string;
  /** 検索URLテンプレート。{query} が検索ワードに置換される */
  searchUrlTemplate: string;
  enabled: boolean;
  displayOrder: number;
  integrationMode: IntegrationMode;
  /** ショップ信頼度スコア 0-100 */
  trustScore: number;
  logoColor: string;
  description: string;
}

/**
 * 初期対象ショップ一覧
 * integrationMode は管理画面で切り替え可能にする想定（将来実装）
 * 初期はすべて link_only
 */
export const SHOPS: ShopDefinition[] = [
  {
    code: 'amazon',
    name: 'Amazon',
    nameEn: 'Amazon',
    baseUrl: 'https://www.amazon.co.jp',
    searchUrlTemplate:
      'https://www.amazon.co.jp/s?k={query}&language=ja_JP',
    enabled: true,
    displayOrder: 1,
    integrationMode: 'link_only',
    trustScore: 95,
    logoColor: '#FF9900',
    description: '国内最大手EC。翌日配送対応商品多数。',
  },
  {
    code: 'shein',
    name: 'SHEIN',
    nameEn: 'SHEIN',
    baseUrl: 'https://jp.shein.com',
    searchUrlTemplate:
      'https://jp.shein.com/pdsearch/{query}/',
    enabled: true,
    displayOrder: 2,
    integrationMode: 'link_only',
    trustScore: 70,
    logoColor: '#000000',
    description: '格安ファッション・雑貨。送料無料条件あり。',
  },
  {
    code: 'aliexpress',
    name: 'AliExpress',
    nameEn: 'AliExpress',
    baseUrl: 'https://ja.aliexpress.com',
    searchUrlTemplate:
      'https://ja.aliexpress.com/wholesale?SearchText={query}',
    enabled: true,
    displayOrder: 3,
    integrationMode: 'link_only',
    trustScore: 65,
    logoColor: '#E62E04',
    description: '中国発の格安EC。送料・到着日数に注意。',
  },
  {
    code: 'temu',
    name: 'Temu',
    nameEn: 'Temu',
    baseUrl: 'https://www.temu.com',
    searchUrlTemplate:
      'https://www.temu.com/search_result.html?search_key={query}&search_method=user',
    enabled: true,
    displayOrder: 4,
    integrationMode: 'link_only',
    trustScore: 60,
    logoColor: '#FF6533',
    description: '超格安価格の直送EC。到着まで数週間かかる場合あり。',
  },
];

/**
 * ショップコードでショップ定義を取得
 */
export function getShopByCode(code: string): ShopDefinition | undefined {
  return SHOPS.find((s) => s.code === code);
}

/**
 * 有効なショップ一覧を表示順で取得
 */
export function getEnabledShops(): ShopDefinition[] {
  return SHOPS.filter((s) => s.enabled && s.integrationMode !== 'disabled').sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * 検索URLを生成
 */
export function buildSearchUrl(shop: ShopDefinition, query: string): string {
  const encoded = encodeURIComponent(query);
  return shop.searchUrlTemplate.replace('{query}', encoded);
}
