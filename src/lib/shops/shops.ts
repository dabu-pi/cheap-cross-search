import { IntegrationMode, ShopDataStatus, AffiliateApprovalStatus } from '@/lib/search/adapters/types';

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
  /**
   * 現在のデータソース状態 (Phase 17 追加)
   * - 'demo':            架空のデモ価格（参考のみ）
   * - 'external_search': 外部検索リンクのみ（価格データなし）
   * - 'real_api':        実 API 接続済み（将来）
   */
  dataStatus: ShopDataStatus;
  /**
   * アフィリエイト / API プログラムの承認状態 (Phase 17 追加)
   * - 'approved':    承認済み（ID 設定済み・API 有効化待ちを含む）
   * - 'pending':     審査中（申請済み・結果待ち）
   * - 'not_applied': 未申請
   * - 'hold':        申請 HOLD 中
   */
  affiliateApprovalStatus: AffiliateApprovalStatus;
  /** 承認状態の補足説明（管理画面・コードコメント用） */
  affiliateNote?: string;
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
    // Phase 17: データソース・承認状態
    dataStatus: 'demo',
    affiliateApprovalStatus: 'approved',
    affiliateNote:
      'Amazon アソシエイト登録済み（affiliate_settings DB設定済み）。' +
      'PA-API は売上3件後に自動有効化。有効化後は amazon-pa-api.ts アダプタへ移行。',
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
    // Phase 17: データソース・承認状態
    dataStatus: 'demo',
    affiliateApprovalStatus: 'not_applied',
    affiliateNote:
      'A8.net 経由 SHEIN アフィリエイトプログラム申請準備完了。未申請。',
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
    // Phase 17: データソース・承認状態
    dataStatus: 'demo',
    affiliateApprovalStatus: 'pending',
    affiliateNote:
      'AliExpress Portals 申請済み（2026-05-23 22:16 PST）。承認メール待ち。' +
      '承認後は aliexpress-portals.ts アダプタへ移行。',
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
    // Phase 17: データソース・承認状態
    dataStatus: 'demo',
    affiliateApprovalStatus: 'hold',
    affiliateNote:
      'Temu アフィリエイト申請は現在 HOLD。サイト改善後に申請タイミングを判断する。',
  },

  // ─── Phase 22: 実商品検索API PoC ─────────────────────────────────────

  {
    code: 'rakuten',
    name: '楽天市場',
    nameEn: 'Rakuten Ichiba',
    baseUrl: 'https://www.rakuten.co.jp',
    searchUrlTemplate:
      'https://search.rakuten.co.jp/search/mall/{query}/',
    enabled: true,
    displayOrder: 5,
    integrationMode: 'official_api',
    trustScore: 88,
    logoColor: '#BF0000',
    description: '国内最大手モール型EC。ポイント還元・送料無料対応多数。',
    // Phase 22: 実商品API（RAKUTEN_APP_ID 設定後に real_api へ）
    dataStatus: 'external_search',
    affiliateApprovalStatus: 'not_applied',
    affiliateNote:
      '楽天アフィリエイト（https://affiliate.rakuten.co.jp/）申請準備中。' +
      'API: 楽天ウェブサービス（RAKUTEN_APP_ID）設定後に real_api モードへ移行。',
  },
  {
    code: 'yahoo',
    name: 'Yahoo!ショッピング',
    nameEn: 'Yahoo! Shopping',
    baseUrl: 'https://shopping.yahoo.co.jp',
    searchUrlTemplate:
      'https://shopping.yahoo.co.jp/search?p={query}',
    enabled: true,
    displayOrder: 6,
    integrationMode: 'official_api',
    trustScore: 85,
    logoColor: '#FF0027',
    description: '国内大手ショッピングモール。PayPayポイント還元あり。',
    // Phase 22: 実商品API（YAHOO_APP_ID 設定後に real_api へ）
    dataStatus: 'external_search',
    affiliateApprovalStatus: 'not_applied',
    affiliateNote:
      'Yahoo!アフィリエイト（ValueCommerce経由）申請準備中。' +
      'API: Yahoo!デベロッパーセンター（YAHOO_APP_ID）設定後に real_api モードへ移行。',
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
