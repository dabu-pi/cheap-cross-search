/**
 * 取得方式（ショップごとに切り替え可能）
 * - official_api:  公式API（Amazon PA-API 等）
 * - affiliate_api: アフィリエイトAPI（各社アフィリエイトプログラム経由）
 * - external_api:  外部検索API（TKAPI 等 第三者サービス経由）
 * - link_only:     検索リンクのみ表示（最終フォールバック）
 * - disabled:      一時停止（検索対象外）
 *
 * Phase 5 追加:
 * - registry.ts がモードに応じてアダプタを選択する
 * - 未実装モード (official_api / affiliate_api) は link_only に安全フォールバック
 * - external_api は ExternalMockAdapter を使用（本格 API 接続前のモック）
 */
export type IntegrationMode =
  | 'official_api'
  | 'affiliate_api'
  | 'external_api'
  | 'link_only'
  | 'disabled';

/**
 * 価格信頼度
 * - high: 公式APIから直接取得
 * - medium: アフィリエイト/外部APIから取得
 * - low: 間接的な取得（鮮度不明）
 * - unknown: 取得なし
 */
export type PriceConfidence = 'high' | 'medium' | 'low' | 'unknown';

/**
 * 検索結果ステータス
 */
export type SearchResultStatus = 'success' | 'link_only' | 'disabled' | 'error';

/**
 * 商品オファー（各ショップの商品掲載情報）
 */
export interface ProductOffer {
  id: string;
  shopCode: string;
  shopName: string;
  externalProductId?: string;
  title: string;
  imageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  itemPrice?: number;
  shippingPrice?: number;
  estimatedTotalPrice?: number;
  currency: string;
  taxIncludedStatus?: 'included' | 'excluded' | 'unknown';
  deliveryEstimateText?: string;
  rating?: number;
  reviewCount?: number;
  priceConfidence: PriceConfidence;
  fetchedAt: string; // ISO 8601
  /** データソース識別子 ('official_api' | 'affiliate_api' | 'external_api' | 'demo') */
  source?: string;
  /** スポンサー商品かどうか */
  isSponsored?: boolean;
  /**
   * productUrl が商品詳細ページではなく検索結果ページを指しているか。
   * true の場合、CTA テキストを「○○で見る」ではなく「○○で検索」に変更する。
   * 実 API 連携後の商品詳細 URL では false にする（省略時 = false として扱う）。
   */
  isSearchPage?: boolean;
  rawData?: Record<string, unknown>;
}

/**
 * ショップ単位の検索結果
 *
 * Phase 5 追加フィールド:
 * - warnings: アダプタが生成した警告一覧（デモデータ使用・フォールバック発生 等）
 * - requestedMode: 元々要求されたモード（フォールバック発生時に元のモードを記録）
 */
export interface ShopSearchResult {
  shopCode: string;
  shopName: string;
  status: SearchResultStatus;
  integrationMode: IntegrationMode;
  searchUrl: string; // link_only用のフォールバックURL
  offers: ProductOffer[];
  errorMessage?: string;
  fetchedAt: string;
  /** アダプタ警告（デモデータ使用・フォールバック発生 等） */
  warnings?: string[];
  /** フォールバック発生時の元モード */
  requestedMode?: IntegrationMode;
}

/**
 * 横断検索全体の結果
 *
 * Phase 5 追加フィールド:
 * - globalWarnings: 全体警告（デモデータ使用中 等）
 * - offers: 全ショップのオファーを集約したフラットリスト
 */
export interface CrossSearchResult {
  query: string;
  normalizedQuery: string;
  searchedAt: string;
  shops: ShopSearchResult[];
  /** 全体警告（デモデータ使用中 等） */
  globalWarnings?: string[];
  /** 全ショップのオファー集約（status==='success' のショップから収集） */
  offers: ProductOffer[];
}

/**
 * 検索アダプタのインターフェース (Phase 5 拡張)
 *
 * すべてのアダプタが実装すべき共通インターフェース。
 * - shopCode / mode を持つ
 * - search() は ShopSearchResult を返す（エラーは throw せず結果に包む）
 */
export interface SearchAdapter {
  shopCode: string;
  mode: IntegrationMode;
  search(input: SearchAdapterInput): Promise<ShopSearchResult>;
}

/**
 * アダプタへの入力型 (Phase 5 追加)
 */
export interface SearchAdapterInput {
  query: string;
  normalizedQuery: string;
  locale?: string;
  currency?: string;
  maxResults?: number;
  timeoutMs?: number;
}

/**
 * @deprecated Phase 5 以前の互換シグネチャ。新コードでは SearchAdapterInput を使う。
 */
export interface SearchAdapterOptions {
  maxResults?: number;
  locale?: string;
  currency?: string;
}
