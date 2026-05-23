/**
 * アフィリエイト関連型定義 (Phase 6)
 *
 * ⚠️ 本番アフィリエイトID は Git に絶対に入れないこと。
 * 実 ID は環境変数 (.env.local) または将来の Supabase DB で管理する。
 */

// ─────────────────────────────────────────────────────────────
// アフィリエイト設定
// ─────────────────────────────────────────────────────────────

/**
 * ショップ別アフィリエイト設定
 *
 * 将来の DB テーブル: affiliate_settings
 * - 現時点はデモ設定（affiliateId 空）
 * - Supabase 設定後に DB 保存・管理画面から編集可能にする
 */
export interface AffiliateSettings {
  shopCode: string;
  shopName: string;
  /** アフィリエイトプログラムが有効か（IDが設定済みかどうか） */
  enabled: boolean;
  /**
   * アフィリエイトID
   * ⚠️ 実 ID は環境変数または DB で管理し、ここには入れない
   */
  affiliateId: string;
  /**
   * リンクテンプレート
   * {product_url} → エンコードされた商品URL
   * {affiliate_id} → アフィリエイトID
   *
   * 例: "https://www.amazon.co.jp/dp/{product_id}?tag={affiliate_id}"
   * シンプル版: "{product_url}&tag={affiliate_id}"
   */
  linkTemplate: string;
  /**
   * URLに追記するトラッキングパラメータ
   * 値に {affiliate_id} が含まれる場合は実ID に置換される
   *
   * 例: { tag: '{affiliate_id}' }
   */
  trackingParams: Record<string, string>;
  priceDisplayAllowed: boolean;
  imageDisplayAllowed: boolean;
  /** キャッシュ許容時間（分） */
  cacheTtlMinutes: number;
  notes: string;
}

// ─────────────────────────────────────────────────────────────
// リンク生成入力
// ─────────────────────────────────────────────────────────────

export interface AffiliateLinkInput {
  shopCode: string;
  /** 商品の直リンク */
  productUrl: string;
  /** アフィリエイトID（未設定なら空文字） */
  affiliateId?: string;
  /** リンクテンプレート（未設定ならトラッキングパラメータを追記） */
  linkTemplate?: string;
  /** トラッキングパラメータ（linkTemplate 未使用時に URL に追記） */
  trackingParams?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
// クリックイベント
// ─────────────────────────────────────────────────────────────

/**
 * クリックイベントデータ
 *
 * 将来の DB テーブル: click_events
 * - 現時点は Supabase 未設定のため no-op (コンソールログのみ)
 */
export interface ClickEventData {
  /** ショップコード */
  shopCode: string;
  /** 商品オファーID (省略可) */
  offerId?: string;
  /** 検索クエリ (省略可) */
  query?: string;
  /** クリックされた URL (affiliate or product URL) */
  clickedUrl: string;
  /** 遷移先ホスト */
  destinationHost: string;
  /** データソース ('demo' / 'external_api_mock' / 'official_api' 等) */
  source?: string;
  /** ログイン中ユーザーID (省略可) */
  userId?: string;
  /** セッションID (省略可) */
  sessionId?: string;
}
