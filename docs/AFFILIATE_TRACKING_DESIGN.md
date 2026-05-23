# アフィリエイト計測設計 — 安買い横断サーチ

Phase 6 実装。Supabase 設定後にこの設計に沿ってテーブルを作成する。

---

## 概要

```
ユーザー → 商品カード「商品ページへ」クリック
           ↓
    /api/click?shop=amazon&to=https://www.amazon.co.jp/dp/...
           ↓
    [1] ホスト検証（ALLOWED_DESTINATION_HOSTS）
    [2] click_events テーブルに INSERT（Supabase 設定済み時）
    [3] 302 リダイレクト → 各ショップ商品ページ
```

---

## DB テーブル設計

### `affiliate_settings` テーブル

アフィリエイト設定をショップごとに管理する。  
**⚠️ affiliiate_id は絶対に Git に入れない。Supabase DB のみで管理する。**

```sql
CREATE TABLE affiliate_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_code     text NOT NULL UNIQUE,         -- 'amazon' / 'shein' / 'aliexpress' / 'temu'
  shop_name     text NOT NULL,
  enabled       boolean NOT NULL DEFAULT false,
  affiliate_id  text NOT NULL DEFAULT '',      -- ⚠️ 実 ID を設定。Git に入れない
  link_template text NOT NULL DEFAULT '',      -- {product_url} / {affiliate_id} プレースホルダー
  tracking_params jsonb NOT NULL DEFAULT '{}', -- キー: パラメータ名, 値: '{affiliate_id}' 等
  price_display_allowed  boolean NOT NULL DEFAULT true,
  image_display_allowed  boolean NOT NULL DEFAULT true,
  cache_ttl_minutes      integer NOT NULL DEFAULT 60,
  notes         text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 更新日時自動セット
CREATE TRIGGER affiliate_settings_updated_at
  BEFORE UPDATE ON affiliate_settings
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

#### RLS（Row Level Security）

```sql
ALTER TABLE affiliate_settings ENABLE ROW LEVEL SECURITY;

-- 一般ユーザーは読み取りのみ（有効な設定だけ公開）
CREATE POLICY "public_read_enabled" ON affiliate_settings
  FOR SELECT USING (enabled = true);

-- 管理者は全操作可能（admin_users テーブルで管理）
CREATE POLICY "admin_all" ON affiliate_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
```

#### 初期データ（INSERT 用 SQL）

```sql
INSERT INTO affiliate_settings (shop_code, shop_name, enabled, affiliate_id, link_template, tracking_params, notes)
VALUES
  ('amazon',     'Amazon',     false, '', 'https://www.amazon.co.jp/dp/{asin}?tag={affiliate_id}',  '{}',                              'Amazon アソシエイトID を設定。PA-API は別途申請が必要。'),
  ('shein',      'SHEIN',      false, '', '',  '{"ref": "{affiliate_id}"}',                          'SHEIN アフィリエイトプログラム参加が必要。'),
  ('aliexpress', 'AliExpress', false, '', 'https://s.click.aliexpress.com/e/{affiliate_id}?productUrl={product_url}', '{}', 'AliExpress Affiliate Program API 経由のトラッキングリンク。'),
  ('temu',       'Temu',       false, '', '',  '{"refer_source": "{affiliate_id}"}',                 'Temu アフィリエイト申請が必要。画像利用条件は要確認。');
```

---

### `click_events` テーブル

商品リンクのクリックをすべて記録する。

```sql
CREATE TABLE click_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_code        text NOT NULL,
  offer_id         text,                -- ProductOffer.id（存在する場合）
  query            text,                -- 検索クエリ
  clicked_url      text NOT NULL,       -- アフィリエイト URL または商品 URL
  destination_host text NOT NULL,       -- クリック先ホスト名
  source           text,                -- 参照元（検索ページ等）
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id       text,                -- 未ログイン時のセッション識別子（将来）
  user_agent       text,                -- リクエストの UA（将来）
  ip_hash          text,                -- IP のハッシュ（個人特定不可・将来）
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 検索クエリ別・ショップ別クリック集計用インデックス
CREATE INDEX click_events_shop_code_idx ON click_events (shop_code);
CREATE INDEX click_events_query_idx     ON click_events (query) WHERE query IS NOT NULL;
CREATE INDEX click_events_created_at_idx ON click_events (created_at DESC);
```

#### RLS（Row Level Security）

```sql
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

-- 管理者のみ閲覧可能
CREATE POLICY "admin_read_only" ON click_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- INSERT は認証不要（未ログイン時もクリックは記録）
-- Service Role Key（Server-side のみ）経由で INSERT
CREATE POLICY "service_role_insert" ON click_events
  FOR INSERT WITH CHECK (true);
```

---

## アフィリエイトURL生成フロー

```
ProductOffer.productUrl（商品 URL）
      ↓
buildOfferClickUrl(offer, query)   ← lib/affiliate/link-builder.ts
      ↓
  affiliateUrl がある → そのまま使う
  ない → productUrl をそのまま使う
      ↓
buildClickTrackingUrl(destinationUrl, shopCode, offerId, query)
      ↓
/api/click?shop=amazon&to=https%3A%2F%2Fwww.amazon.co.jp...&offerId=xxx&q=query
      ↓
api/click/route.ts
  → to param を ALLOWED_DESTINATION_HOSTS で検証
  → logClickEvent() を呼び出す（非同期・非ブロッキング）
  → 302 リダイレクト
```

---

## アフィリエイト ID の管理方針

### 開発中（現在の状態）

```
affiliateId = '' （空文字）
→ buildAffiliateUrl() は productUrl をそのまま返す（安全フォールバック）
→ アフィリエイト報酬は発生しない
→ クリック計測のみ機能する（logClickEvent は現在 no-op）
```

### 本番化時の手順

1. 各プログラムに申請・審査通過
2. Supabase `affiliate_settings` テーブルに `affiliate_id` を INSERT（管理画面から）
3. `src/lib/affiliate/demo-settings.ts` の `enabled: false` は変更しない（DB 管理に移行するため）
4. `buildAffiliateUrlFromSettings()` が DB から設定を読み込むよう engine.ts を更新
5. `logClickEvent()` の TODO コメントアンコメントして Supabase INSERT を有効化

### セキュリティ注意事項

| 項目 | 方針 |
|---|---|
| アフィリエイト ID | Supabase DB のみ管理。Git・フロントエンドバンドル・環境変数ログに入れない |
| open redirect 対策 | `/api/click` の `ALLOWED_DESTINATION_HOSTS` で宛先ホストを許可リスト管理 |
| クリックデータ | IP はハッシュ化のみ保存。個人特定可能な情報は記録しない |
| RLS | `click_events` の SELECT は管理者のみ・INSERT はサービスロールキーのみ |

---

## ファイル対応表

| ファイル | 役割 |
|---|---|
| `src/lib/affiliate/types.ts` | 型定義（AffiliateSettings / AffiliateLinkInput / ClickEventData）|
| `src/lib/affiliate/link-builder.ts` | アフィリエイト URL 生成・クリック URL 生成 |
| `src/lib/affiliate/demo-settings.ts` | デモ設定（ID 空文字・テストプレビュー）|
| `src/lib/analytics/click-events.ts` | クリックイベント記録（現在 no-op）|
| `src/app/api/click/route.ts` | クリック計測 + リダイレクト Route Handler |
| `src/components/search/ProductCard.tsx` | 商品カード（PR バッジ・rel=sponsored・クリック URL）|
| `src/app/disclaimer/page.tsx` | 免責事項（PR・アフィリエイト開示）|

---

## 関連ドキュメント

- [`docs/ADAPTER_ARCHITECTURE.md`](./ADAPTER_ARCHITECTURE.md) — 取得アダプタ設計
- [`docs/SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) — Supabase 設定手順
- [`supabase/migrations/0001_auth_favorites.sql`](../supabase/migrations/0001_auth_favorites.sql) — 既存 DB スキーマ

---

*最終更新: 2026-05-24 Phase 6 実装*
