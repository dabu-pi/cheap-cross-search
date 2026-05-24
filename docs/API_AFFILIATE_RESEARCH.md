# 実API/アフィリエイト調査レポート — 安買い横断サーチ Phase 5b

作成: 2026-05-24  
最終更新: 2026-05-24（Amazonアソシエイト登録完了・affiliate_settings DB更新済み）  
対象ブランチ: `feature/phase8-supabase-vercel`  
本番URL: https://cheap-cross-search.vercel.app

---

## 調査サマリー

| ショップ | 商品検索API | アフィリエイト | 優先分類 | 推奨アクション |
|---|---|---|---|---|
| Amazon | ✅ PA-API v5（要アソシエイト）| ✅ **登録完了** | `ready_to_apply` | ✅ 申請完了・DB登録済み / 次: PA-API有効化 |
| AliExpress | ✅ Portals Affiliate API（要登録）| ✅ AliExpress Portals | `ready_to_apply` | Portals登録 → API申請 |
| SHEIN | ❌ 公式なし | ✅ 提携ネットワーク経由 | `needs_review` | バリューコマース/A8経由で申請 |
| Temu | ❌ 公式なし | ✅ Temu Affiliate（公式）| `needs_review` | Temu Affiliate登録・API確認 |
| 楽天 | ✅ 楽天商品検索API（無料）| ✅ 楽天アフィリエイト | `ready_to_apply` | 楽天デベロッパー登録（将来候補）|
| Yahoo!ショッピング | ✅ Yahoo!ショッピング API（無料）| ✅ Yahoo!アフィリエイト | `ready_to_apply` | YDN登録（将来候補）|

---

## 1. Amazon

### 1-1. 商品検索API

**Amazon Product Advertising API (PA-API) v5**

| 項目 | 内容 |
|---|---|
| 公式URL | https://webservices.amazon.co.jp/paapi5/documentation/ |
| 取得可能データ | 商品名・価格・画像・レビュー・配送情報・ASIN・アフィリエイトリンク |
| 日本向け | ✅ amazon.co.jp 対応あり |
| 審査 | Amazonアソシエイトに参加後、自動有効化（売上実績が3件に達するまで無効） |
| 料金 | 無料（アソシエイト収益の一部が前提）|
| レート制限 | 1秒1リクエスト（収益に応じて上限緩和）|
| 画像表示 | ✅ 許可（`ImageSets` で取得）|
| 価格キャッシュ | ⚠️ 24時間以上のキャッシュ禁止（規約：Commercial Use Agreements）|
| API保存 | ❌ 価格・在庫データの保存禁止（リアルタイム表示のみ）|

**注意: PA-API は初回登録から180日以内に3件以上の紹介売上が必要。達成できない場合はアクセス停止。**

### 1-2. アフィリエイト

| 項目 | 内容 |
|---|---|
| プログラム名 | Amazonアソシエイト |
| 申請URL | https://affiliate.amazon.co.jp/ |
| 必要情報 | サイトURL・コンテンツ説明・トラフィック情報・連絡先・振込先 |
| サイト審査 | ✅ あり（人力レビュー。申請後180日以内に3件売上必要）|
| 本番URLで申請可否 | ✅ `https://cheap-cross-search.vercel.app` で申請可能 |
| 報酬対象 | クリック後24時間以内のカート追加・購入 |
| リンク生成 | アソシエイトIDを `tag=` パラメータとして付与 |
| アフィリエイトIDとAPIの関係 | アソシエイトID取得後 → PA-API 利用申請（自動） |

### 1-3. 規約上の注意点

- 価格表示: リアルタイム取得値のみ可。「Amazon調べ」等の免責表記推奨
- 「スポンサード」「PR」「アフィリエイト」の開示表記が必要（サイト上）
- 価格データのキャッシュ上限: 24時間未満
- 商標・ロゴ: Amazonのロゴ使用は制限あり（アソシエイト規約参照）
- 既存の免責バナー（`/disclaimer`・`/safety-policy`）でほぼ対応可能

### 1-4. 登録状況（2026-05-24）

| 項目 | 状態 |
|---|---|
| アソシエイト申請 | ✅ 完了 |
| affiliate_id | ✅ DB登録済み（`cheapc***-22`・Gitコミットなし）|
| `affiliate_settings.enabled` | ✅ `true` |
| PA-API アクセス | ⏳ 売上3件達成後に自動有効化 |
| Access Key / Secret Key | 🔜 PA-API 有効化後に取得・Vercel env に設定 |

### 1-5. 実装方針

```typescript
// src/lib/search/adapters/amazon-pa-api.ts（将来実装）
// PA-API v5 / GetItems / SearchItems エンドポイント使用
// サーバーサイドのみで呼び出し（APIキーをフロントに出さない）
```

---

## 2. AliExpress

### 2-1. 商品検索API

**AliExpress Portals Affiliate API**

| 項目 | 内容 |
|---|---|
| 公式URL | https://portals.aliexpress.com/ |
| API doc | https://developers.aliexpress.com/en/doc.htm |
| 取得可能データ | 商品名・価格（USD・元）・画像・レビュー・配送先・アフィリエイトリンク生成 |
| 日本向け | ⚠️ 日本への配送対応商品あり。円建て価格は別途換算が必要 |
| 審査 | Portalsアカウント登録後、API申請（数日〜1週間） |
| 料金 | 無料 |
| レート制限 | 1秒2リクエスト程度（プランによる）|
| 画像表示 | ✅ 許可 |
| 価格キャッシュ | 24〜72時間（Portals規約で規定）|
| API保存 | △ キャッシュ期間内であれば保存可（詳細は規約要確認）|

**AliExpress Partner API（上位）:**
大規模パートナー向け。申請・審査が厳しい。現時点では Portals API で十分。

### 2-2. アフィリエイト

| 項目 | 内容 |
|---|---|
| プログラム名 | AliExpress Portals Affiliate |
| 申請URL | https://portals.aliexpress.com/signup |
| 必要情報 | サイト/アプリ情報・月間PV・コンテンツ種別・プロモーション方法 |
| サイト審査 | ✅ あり（軽審査。比較サイトは通りやすい傾向）|
| 本番URLで申請可否 | ✅ 可 |
| 報酬対象 | クリック後30日以内の購入（カテゴリ別コミッション率あり）|
| リンク生成 | API経由で商品ごとのアフィリエイトリンクを動的生成可能 |

### 2-3. 規約上の注意点

- 価格は頻繁に変動する（AliExpressは特にセール期間中）→ 最終確認促す免責必要
- 「アフィリエイトリンク」「PR」表記が必要
- 配送コスト・関税は商品によって異なる → 免責バナー対応済み

### 2-4. 実装方針

```typescript
// src/lib/search/adapters/aliexpress-portals.ts（将来実装）
// Portals API / aliexpress.affiliate.product.query エンドポイント
// サーバーサイドのみ（AppKey/AppSecret 管理）
```

---

## 3. SHEIN

### 3-1. 商品検索API

**❌ 公式商品検索APIは一般提供なし**

| 項目 | 内容 |
|---|---|
| 公式API | ❌ なし（SHEINは非公開EC。APIは提供していない）|
| パートナーAPI | 大手インフルエンサー・メディア向けに個別契約の可能性あり |
| スクレイピング | ❌ 禁止（規約 §2.1. 自動クロール禁止）|
| 代替手段 | アフィリエイトネットワーク経由のリンク生成のみ |
| データ取得 | 商品カードは `link_only` で対応（商品URLのみ生成）|

### 3-2. アフィリエイト

| 項目 | 内容 |
|---|---|
| 申請方法 | アフィリエイトネットワーク経由（直接申請不可の場合が多い）|
| 主な提携ネットワーク（日本）| **バリューコマース**・**A8.net**・**afb** |
| バリューコマース | https://www.valuecommerce.com/ |
| A8.net | https://www.a8.net/ |
| 必要情報 | サイト登録・コンテンツ確認・月間PV目安 |
| リンク生成 | ネットワーク発行のアフィリエイトリンク（商品個別URLにパラメータ付与）|
| 本番URLで申請可否 | ✅ 可（比較サイトとして登録）|
| 商品画像 | ❌ SHEIN商品画像のAPI取得は不可。ネットワーク提供の場合もあり |

### 3-3. 規約上の注意点

- 商品画像はSHEINのCDNから直接引用禁止（利用規約 §7）
- 価格はSHEINサイトで確認するよう誘導する形式が安全
- 「PR」「広告」開示必須（景表法・ASA対応）

### 3-4. 実装方針

```
Phase 5b では link_only のまま維持。
アフィリエイトリンク（ネットワーク経由）が発行されたら、
affiliate_settings.link_template にテンプレートを設定するだけで対応可能。
商品カードは「SHEINで検索する」リンクのみ表示。
```

---

## 4. Temu

### 4-1. 商品検索API

**❌ 公式商品検索APIは一般提供なし（2026-05 時点）**

| 項目 | 内容 |
|---|---|
| 公式API | ❌ 商品検索APIの一般公開なし |
| パートナーAPI | 公式アフィリエイトプログラム参加後に一部提供の可能性 |
| スクレイピング | ❌ 禁止（Terms of Use §4）|
| 代替手段 | アフィリエイトリンク + `link_only` |

### 4-2. アフィリエイト

| 項目 | 内容 |
|---|---|
| プログラム名 | Temu Affiliate（公式）|
| 申請URL | https://www.temu.com/affiliate.html |
| 必要情報 | SNSアカウント / サイトURL / フォロワー数またはPV / プロモーション方法 |
| サイト審査 | ✅ あり（数日）|
| 本番URLで申請可否 | ✅ 可 |
| 報酬対象 | クリック後購入（コミッション率高め：カテゴリ別に異なる）|
| リンク生成 | カスタムリンク生成（アフィリエイトダッシュボードから）|
| API提供 | 申請後に確認（一部パートナーに商品フィード提供の情報あり）|

### 4-3. 規約上の注意点

- Temu の商品価格・画像は急変動することがある
- 「パートナーリンク」開示必要
- 商品在庫・価格の保証なし → 免責バナー対応済み

### 4-4. 実装方針

```
Phase 5b では link_only のまま維持。
Temu Affiliate 登録後、アフィリエイトリンクを affiliate_settings に設定。
商品フィードAPIが利用可能になれば external_api アダプタに昇格。
```

---

## 5. 将来候補（楽天・Yahoo!）

### 楽天市場

| 項目 | 内容 |
|---|---|
| 商品検索API | ✅ 楽天商品検索API（無料・即日利用可）|
| 申請URL | https://webservice.rakuten.co.jp/ |
| アフィリエイト | ✅ 楽天アフィリエイト（https://affiliate.rakuten.co.jp/）|
| 優先分類 | `ready_to_apply` |
| 備考 | APIキー即日取得可。日本語商品データが充実。Phase 5b後半の候補 |

### Yahoo!ショッピング

| 項目 | 内容 |
|---|---|
| 商品検索API | ✅ Yahoo!ショッピング商品検索API（無料）|
| 申請URL | https://developer.yahoo.co.jp/webapi/shopping/ |
| アフィリエイト | ✅ ValueCommerce / Yahoo!アフィリエイト |
| 優先分類 | `ready_to_apply` |
| 備考 | APIキー即日取得可。将来的に日本市場強化候補 |

---

## 実装優先順位

### フェーズ分け

| 優先 | ショップ | 理由 | 必要アクション |
|---|---|---|---|
| **1位** | AliExpress | API申請が最も通りやすい・商品データが豊富・国際比較に合う | Portals登録 → API申請 |
| **2位** | Amazon | 日本ユーザー最重要・PA-API完備・信頼性高い | アソシエイト申請 → PA-API有効化 |
| **3位** | 楽天 | 日本市場・即日APIキー取得可・API無料 | デベロッパー登録 |
| **4位** | Temu | アフィリエイト登録のみ（API不明）| Temu Affiliate申請 |
| **5位** | SHEIN | APIなし・ネットワーク経由のみ | バリューコマース/A8登録 |

### 分類まとめ

| ショップ | 分類 | 理由 |
|---|---|---|
| Amazon | `ready_to_apply` | PA-API完備・日本市場最重要 |
| AliExpress | `ready_to_apply` | Portals API完備・申請比較的容易 |
| 楽天 | `ready_to_apply` | 即日APIキー取得可・将来候補 |
| Temu | `needs_review` | アフィリエイト登録後にAPI可否確認 |
| SHEIN | `needs_review` | APIなし・ネットワーク申請必要 |
| Yahoo! | `ready_to_apply` | 将来候補・即日APIキー取得可 |

---

## 人が申請すべき項目一覧

### 優先度高（Phase 5b 開発前に申請開始）

| # | ショップ | 申請先 | URL | 必要なもの |
|---|---|---|---|---|
| 1 | AliExpress | Portals Affiliate | https://portals.aliexpress.com/signup | サイトURL・月間PV目安・コンテンツ説明 |
| 2 | ~~Amazon~~ | ~~Amazonアソシエイト~~ | ~~https://affiliate.amazon.co.jp/~~ | **✅ 登録完了（2026-05-24）**。次: PA-API有効化（売上3件後）|

### 優先度中（申請開始後、並行で）

| # | ショップ | 申請先 | URL | 必要なもの |
|---|---|---|---|---|
| 3 | Temu | Temu Affiliate | https://www.temu.com/affiliate.html | サイトURL・PV |
| 4 | バリューコマース（SHEIN用）| ValueCommerce | https://www.valuecommerce.com/ | サイト登録 |

### 将来（Phase 5b 後半以降）

| # | ショップ | 申請先 | URL | 必要なもの |
|---|---|---|---|---|
| 5 | 楽天 | 楽天ウェブサービス | https://webservice.rakuten.co.jp/ | メールアドレスのみ |
| 6 | Yahoo! | Yahoo!デベロッパー | https://developer.yahoo.co.jp/ | Yahoo! ID |

---

## Phase 5b 次アクション

### 人が実施すること（Claudeは実装しない）

1. **AliExpress Portals** に `https://cheap-cross-search.vercel.app` で申請登録
2. **Amazonアソシエイト** に申請（振込先口座情報が必要）
3. 審査通過後、各アフィリエイトIDを Supabase DB の `affiliate_settings` に UPDATE
   ```sql
   UPDATE public.affiliate_settings
   SET affiliate_id = 'YOUR-ID', enabled = true, updated_at = now()
   WHERE shop_code = 'aliexpress';
   ```

### Claudeが実装すること（申請通過後）

1. `src/lib/search/adapters/aliexpress-portals.ts` — Portals API アダプタ（最初）
2. `src/lib/search/adapters/amazon-pa-api.ts` — PA-API v5 アダプタ（2番目）
3. `src/lib/shops/shops.ts` — 各ショップの `integrationMode` を更新
4. Server-side API Routes / Route Handlers でAPIキーを隠す
5. 免責・PR表記の自動付与（リンクにアフィリエイトフラグがある場合）

### 規約対応で今すぐ可能な軽微な修正

- `affiliate_settings` の `notes` フィールドに申請状況を記録（DB UPDATE）
- `docs/SAFETY_PUBLICATION_CHECKLIST.md` に「PR表記確認」を追加

---

## セキュリティ・規約遵守まとめ

| 項目 | 方針 |
|---|---|
| APIキー管理 | サーバーサイドのみ（`.env.local` / Vercel env）。Gitコミット禁止 |
| アフィリエイトID管理 | Supabase DB のみ（`affiliate_settings`）。Gitコミット禁止 |
| 価格データ保存 | Amazon: 24時間以内のキャッシュのみ（長期保存禁止）|
| 画像表示 | 各ショップのAPI/規約に従う。SHEIN画像の直接引用禁止 |
| PR表記 | アフィリエイトリンクには「PR」「広告」「アフィリエイト」表記必須（景表法）|
| スクレイピング | 全ショップで禁止。絶対に実装しない |

---

## 関連ドキュメント

- `docs/ADAPTER_ARCHITECTURE.md` — アダプタ構造
- `docs/AFFILIATE_TRACKING_DESIGN.md` — アフィリエイト計測設計（`/api/click`・DB設計）
- `docs/SAFETY_PUBLICATION_CHECKLIST.md` — 安全公開チェックリスト
- `supabase/migrations/0002_tracking_reports_admin.sql` — `affiliate_settings` テーブル定義
