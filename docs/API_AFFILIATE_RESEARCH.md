# 実API/アフィリエイト調査レポート — 安買い横断サーチ Phase 5b

作成: 2026-05-24  
最終更新: 2026-05-24（Temu / SHEIN 申請準備調査完了）  
対象ブランチ: `feature/phase8-supabase-vercel`  
本番URL: https://cheap-cross-search.vercel.app

---

## 調査サマリー

| ショップ | 商品検索API | アフィリエイト | 優先分類 | 推奨アクション |
|---|---|---|---|---|
| Amazon | ✅ PA-API v5（要アソシエイト）| ✅ **登録完了** | `ready_to_apply` | ✅ 申請完了・DB登録済み / 次: PA-API有効化 |
| AliExpress | ✅ Portals Affiliate API（要登録）| ✅ AliExpress Portals | `submitted_under_review` | ⏳ 申請済み・審査中（2026-05-23）|
| SHEIN | ❌ 公式なし | ✅ A8.net / impact.com 経由 | `ready_to_apply` | A8.net でSHEINプログラム申請 |
| Temu | ❌ 公式なし | ✅ Temu Affiliate / impact.com | `ready_to_apply` | temu.com/affiliate.html 申請 |
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
| 申請URL | https://portals.aliexpress.com/affiportals/web/portals.htm#/home |
| ~~旧URL（404）~~ | ~~https://portals.aliexpress.com/signup~~ |
| 必要情報 | サイト/アプリ情報・月間PV・コンテンツ種別・プロモーション方法 |
| サイト審査 | ✅ あり（軽審査。比較サイトは通りやすい傾向）|
| 本番URLで申請可否 | ✅ 可 |
| 報酬対象 | クリック後30日以内の購入（カテゴリ別コミッション率あり）|
| リンク生成 | API経由で商品ごとのアフィリエイトリンクを動的生成可能 |

### 2-2b. 申請状況（2026-05-24）

| 項目 | 内容 |
|---|---|
| 申請日時 | 2026-05-23 22:16:08 PST |
| サイト名 | Cheap Cross Search |
| サイトURL | https://cheap-cross-search.vercel.app |
| チャンネル | Shopping platforms / Price comparison |
| 状態 | **Under review** |
| 審査目安 | 1時間〜2営業日以上 |
| 結果通知 | メールで通知予定 |
| 承認後の作業 | affiliate_settings.aliexpress をDB更新 → aliexpress-portals.ts アダプタ実装 |

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
| 公式商品検索API | ❌ なし（SHEIN は非公開EC）|
| パートナーAPI | 大手インフルエンサー / 大規模メディア向けに個別契約の可能性あり |
| スクレイピング | ❌ 禁止（利用規約 §2.1 / §7）|
| 代替手段 | ASP 経由アフィリエイトリンク + `link_only` |

### 3-2. アフィリエイト申請経路

**経路1: A8.net（日本・最優先）**

| 項目 | 内容 |
|---|---|
| プラットフォーム | A8.net（エーハチネット）— 日本最大のアフィリエイトASP |
| A8.net 登録URL | https://www.a8.net/ |
| SHEIN プログラム検索 | A8 ログイン後 → 「広告主を探す」→「SHEIN」で検索 |
| 申請手順 | A8.net 会員登録（無料）→ SHEIN プログラムに申請 → 審査通過後リンク発行 |
| 審査目安 | 数日〜1週間 |
| 本番URLで申請可否 | ✅ 可（比較・検索サイトカテゴリで登録）|
| リンク形式 | `https://px.a8.net/svt/ejp?a8mat=...&a8ejpuid=...` 形式 |
| コミッション | セール期間中に高騰することがある（5〜15%程度が目安）|

**経路2: impact.com（グローバル）**

| 項目 | 内容 |
|---|---|
| URL | https://app.impact.com/ |
| 方法 | impact.com にサインアップ → SHEIN プログラムを検索して申請 |
| 日本語対応 | △（英語インターフェース）|
| SHEIN の掲載 | グローバルプログラムあり。JP市場への適用可否は要確認 |

**経路3: ValueCommerce（日本）**

| 項目 | 内容 |
|---|---|
| URL | https://www.valuecommerce.com/ |
| 申請方法 | ValueCommerce 登録 → 広告主一覧で SHEIN を検索して申請 |
| 備考 | Yahoo!ショッピング連携が強み。SHEIN掲載可否は要確認 |

**経路4: afb（日本）**

| 項目 | 内容 |
|---|---|
| URL | https://www.afb.ne.jp/ |
| 備考 | A8・VC と並ぶ日本の主要ASP。SHEIN掲載可否は要確認 |

### 3-3. 申請に必要な準備情報

ASP（A8.net）の申請フォームへの入力に備えて以下を準備する:

```
サイト名:       安買い横断サーチ / Cheap Cross Search
サイトURL:      https://cheap-cross-search.vercel.app
カテゴリ:       ショッピング・価格比較
コンテンツ説明:
  Amazon・SHEIN・AliExpress・Temu の商品を横断検索し、
  価格を比較できるサービスです。ユーザーが商品を検索すると
  各ショップの結果が一覧で表示され、各ショップの商品ページへ誘導します。
プロモーション手法: Webサイト（価格比較）
月間PV目安:     ローンチ初期（< 1,000 / 月）
```

### 3-4. 規約上の注意点

- 商品画像を SHEIN CDN から直接引用禁止（利用規約 §7）
- 価格表示には「SHEIN にて確認」の誘導が安全（リアルタイム取得不可のため）
- 「PR」「広告」「アフィリエイト」開示必須（景表法・ASA対応）→ 免責バナー対応済み

### 3-5. 実装方針

```
申請・承認後:
  affiliate_settings.shein を DB UPDATE
  （enabled=true、link_template にA8.net リンクテンプレートを設定）

現時点: link_only のまま維持
  商品カードは「SHEIN で検索する」リンクのみ
  アフィリエイトリンク取得後は link_template の差し替えだけで対応可能

将来:
  商品APIが提供される場合は external_api アダプタへ昇格
  （現状では不可）
```

### 3-6. 申請状況

| 項目 | 状態 |
|---|---|
| 申請状態 | 🔜 未申請（準備完了）|
| 推奨申請経路 | A8.net → SHEIN プログラム申請（最優先）|
| 申請準備 | ✅ 準備情報整理済み（§3-3 参照）|

---

## 4. Temu

### 4-1. 商品検索API

**❌ 公式商品検索APIは一般提供なし（2026-05 時点）**

| 項目 | 内容 |
|---|---|
| 公式商品検索API | ❌ 一般公開なし |
| パートナー向け商品フィード | △ 大口パートナーに提供の事例あり。申請後に確認 |
| スクレイピング | ❌ 禁止（Terms of Use §4 – Prohibited Conduct）|
| 代替手段 | アフィリエイトリンク（link_only）|

### 4-2. アフィリエイト申請情報

**経路1: Temu 公式 Affiliate ページ（グローバル・メイン）**

| 項目 | 内容 |
|---|---|
| プログラム名 | Temu Affiliate Program |
| 申請URL | https://www.temu.com/affiliate.html |
| プラットフォーム | impact.com（Temu のアフィリエイト管理基盤）|
| 必要情報 | サイトURL・コンテンツ種別・月間PV目安・プロモーション手法 |
| サイト審査 | ✅ あり（数日〜1週間） |
| 本番URLで申請可否 | ✅ 可（価格比較サイトとして登録）|
| 報酬 | 新規購入者限定コミッション高め（キャンペーン依存）|
| リンク生成 | impact.com ダッシュボードからカスタムリンク発行 |
| API提供 | impact.com 経由で商品フィード（XML/CSV）提供の可能性あり |

**経路2: impact.com（アフィリエイトネットワーク直接）**

| 項目 | 内容 |
|---|---|
| URL | https://app.impact.com/ |
| 方法 | impact.com にサインアップ → Temu のプログラムを検索して申請 |
| 日本語対応 | △（英語インターフェース） |
| メリット | impact.com 上で複数ブランドをまとめて管理できる |

**経路3: 日本ASP経由（確認推奨）**

| ASP | URL | SHEIN掲載可否 |
|---|---|---|
| A8.net | https://www.a8.net/ | 要確認（Temu JPプログラムの有無を広告主一覧で検索）|
| バリューコマース | https://www.valuecommerce.com/ | 要確認 |

### 4-3. 申請に必要な準備情報

申請フォームへの入力に備えて以下を準備する:

```
サイト名（英語）: Cheap Cross Search
サイト名（日本語）: 安買い横断サーチ
サイトURL:        https://cheap-cross-search.vercel.app
カテゴリ:         Shopping / Price Comparison
コンテンツ説明:
  A price comparison website that aggregates search results from
  Amazon, SHEIN, AliExpress, and Temu. Visitors can compare prices
  across multiple shops and click through to purchase.
プロモーション手法: Website / Price Comparison Tool
月間PV目安:       Launch stage（具体的数値を求められた場合は「< 1,000 / month (new site)」）
SNS:              （なければ「Website only」）
```

### 4-4. 規約上の注意点

- 価格・画像は急変動（Temu はセール・クーポン多用）→ 免責バナー対応済み
- 「パートナーリンク」「PR」「広告」開示必須（景表法対応）
- 商品画像の直接ホスティング禁止
- 新規ユーザー限定コミッションが中心 → 既存ユーザーは対象外になる場合あり

### 4-5. 実装方針

```
申請・承認後:
  affiliate_settings.temu を DB UPDATE（enabled=true、link_template設定）
  affiliate_settings.temu の notes に承認日・impact.com publisher ID を記録

将来（API提供確認後）:
  src/lib/search/adapters/temu-affiliate.ts
  impact.com 商品フィードが利用可能であれば external_api アダプタへ昇格

現時点: link_only のまま維持
```

### 4-6. 申請状況

| 項目 | 状態 |
|---|---|
| 申請状態 | 🔜 未申請（準備完了）|
| 推奨申請経路 | temu.com/affiliate.html → impact.com |
| 申請準備 | ✅ 準備情報整理済み（§4-3 参照）|

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

### 分類まとめ（2026-05-24 更新）

| ショップ | 分類 | 状態 |
|---|---|---|
| Amazon | `approved` | ✅ 登録完了・DB設定済み |
| AliExpress | `submitted_under_review` | ⏳ 審査中（2026-05-23 22:16 PST）|
| Temu | `ready_to_apply` | 🔜 未申請・準備完了 |
| SHEIN | `ready_to_apply` | 🔜 未申請・準備完了（A8.net 経由）|
| 楽天 | `ready_to_apply` | 🔜 将来候補・即日APIキー取得可 |
| Yahoo! | `ready_to_apply` | 🔜 将来候補・即日APIキー取得可 |

---

## 人が申請すべき項目一覧

### 優先度高（Phase 5b 開発前に申請開始）

| # | ショップ | 申請先 | URL | 必要なもの |
|---|---|---|---|---|
| 1 | ~~AliExpress~~ | ~~Portals Affiliate~~ | ~~https://portals.aliexpress.com/signup~~ | **⏳ 申請済み・審査中**（2026-05-23 22:16 PST）|
| 2 | ~~Amazon~~ | ~~Amazonアソシエイト~~ | ~~https://affiliate.amazon.co.jp/~~ | **✅ 登録完了（2026-05-24）**。次: PA-API有効化（売上3件後）|

### 優先度中（次に申請する）

| # | ショップ | 申請先 | URL | 必要なもの | 状態 |
|---|---|---|---|---|---|
| 3 | Temu | temu.com Affiliate | https://www.temu.com/affiliate.html | サイトURL・コンテンツ説明・PV目安 | 🔜 未申請（準備完了）|
| 4 | SHEIN | **A8.net**（最優先）| https://www.a8.net/ | A8会員登録 → SHEIN プログラム申請 | 🔜 未申請（準備完了）|
| 4b | SHEIN | impact.com（代替）| https://app.impact.com/ | impact.com 登録 → SHEIN 検索 | 🔜 補助経路 |

### 将来（Phase 5b 後半以降）

| # | ショップ | 申請先 | URL | 必要なもの |
|---|---|---|---|---|
| 5 | 楽天 | 楽天ウェブサービス | https://webservice.rakuten.co.jp/ | メールアドレスのみ |
| 6 | Yahoo! | Yahoo!デベロッパー | https://developer.yahoo.co.jp/ | Yahoo! ID |

---

## Phase 5b 次アクション（2026-05-24 更新）

### 申請状況まとめ

| ショップ | 状態 | 次アクション |
|---|---|---|
| Amazon | ✅ 登録完了・DB設定済み | PA-API 有効化待ち（売上3件後）|
| AliExpress | ⏳ **審査中**（2026-05-23 22:16 PST）| 承認メール待ち |
| Temu | 🔜 未申請（準備完了） | temu.com/affiliate.html で申請 |
| SHEIN | 🔜 未申請（準備完了） | A8.net 登録 → SHEIN プログラム申請 |

### 人が次に実施すること

**① Temu Affiliate 申請（優先）**
```
URL:  https://www.temu.com/affiliate.html
入力値（§4-3 参照）:
  - サイト名: Cheap Cross Search
  - サイトURL: https://cheap-cross-search.vercel.app
  - カテゴリ: Shopping / Price Comparison
  - 月間PV: Launch stage / < 1,000 / month (new site)
```

**② SHEIN / A8.net 申請（並行可）**
```
URL:  https://www.a8.net/
手順:
  1. A8.net 会員登録（無料・メール認証）
  2. ログイン → 「広告主を探す」→「SHEIN」で検索
  3. SHEIN プログラムに申請
  4. 審査通過後、A8 管理画面からアフィリエイトリンクを取得
```

**③ AliExpress 承認後**
```
承認メール受領後:
  Supabase DB の affiliate_settings.aliexpress を更新
  → Claude が aliexpress-portals.ts アダプタ実装へ進む
```

### Claudeが実装すること（各申請通過後）

| 優先 | 実装内容 | トリガー |
|---|---|---|
| 1位 | `src/lib/search/adapters/aliexpress-portals.ts` | AliExpress 承認後 |
| 2位 | `src/lib/search/adapters/amazon-pa-api.ts` | PA-API有効化後（売上3件）|
| 3位 | Temu / SHEIN アフィリエイトリンク設定 | 各承認後 |
| 将来 | `src/lib/shops/shops.ts` の integrationMode 更新 | 上記と同時 |

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
