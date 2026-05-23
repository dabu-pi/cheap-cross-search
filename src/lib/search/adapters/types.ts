/**
 * 取得方式（ショップごとに切り替え可能）
 * - official_api: 公式API
 * - affiliate_api: アフィリエイトAPI
 * - external_api: TKAPI / 外部検索API
 * - link_only: 検索リンクのみ表示（fallback）
 * - disabled: 一時停止
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
  rawData?: Record<string, unknown>;
}

/**
 * ショップ単位の検索結果
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
}

/**
 * 横断検索全体の結果
 */
export interface CrossSearchResult {
  query: string;
  normalizedQuery: string;
  searchedAt: string;
  shops: ShopSearchResult[];
}

/**
 * 検索アダプタのインターフェース
 */
export interface SearchAdapter {
  shopCode: string;
  search(query: string, options?: SearchAdapterOptions): Promise<ShopSearchResult>;
}

export interface SearchAdapterOptions {
  maxResults?: number;
  locale?: string;
  currency?: string;
}
