# 楽天市場 API 復旧作業記録（2026-05-25）

ECサイト比較.com / cheap-cross-search の楽天市場 real API 表示復旧の調査・切り分け記録。

## 1. 目的

楽天市場の real API 実商品表示を復旧する。原因が **Vercel の `RAKUTEN_APP_ID` 無効値** か、
**コード側（parameter 名・endpoint・request 組み立て）** の問題かを切り分ける。

## 2. 前回エラー（Phase 23 / 23A）

production の楽天 API 呼び出しで以下が発生していた。

- HTTP 400
- `error: wrong_parameter`
- `error_description: specify valid applicationId`

Phase 23A で「API エラー時は `status:'link_only'` フォールバックへ落とす」修正済みのため、
production は壊れず動作するが、楽天の実商品表示は未復旧の状態だった。

## 3. 原因切り分け結果（結論：コードは正しい・env 値が無効）

### コード側レビュー（`src/lib/search/adapters/rakuten-ichiba.ts`）

| 観点 | 結果 |
|---|---|
| endpoint | ✅ 正しい（`https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601`）|
| parameter 名 | ✅ 正しい（`applicationId` / `keyword` / `hits` / `imageFlag` / `sort` / `format`）|
| `applicationId` 送信 | ✅ 送信している（`process.env.RAKUTEN_APP_ID`）|
| `keyword` | ✅ `input.query` を送信・空にならない |
| encode | ✅ `URLSearchParams` で正しくエンコード |
| env 名一致 | ✅ コード `RAKUTEN_APP_ID` ＝ `.env.local.example` の `RAKUTEN_APP_ID` |
| affiliateId 必須扱い | ✅ 必須ではない（未使用・undefined で問題なし）|
| error handling | ✅ 妥当（API 成功時は real 商品を返す）|
| fallback の強さ | ✅ 過剰でない（未設定 or エラー時のみ link_only。valid 応答なら success）|
| registry 配線 | ✅ `official_api` + `shopCode==='rakuten'` → `RakutenIchibaAdapter` を使用（`registry.ts`）|
| shops.ts | ✅ `integrationMode:'official_api'` / `dataStatus:'real_api'` |

→ コード側に修正すべき問題は無い。

### ライブ検証（endpoint / parameter の正しさを実証）

楽天 API エンドポイントに**明らかに無効なダミー applicationId**（秘密値ではない）でリクエストし、
エラー形状を確認した。

```
GET https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?applicationId=<dummy>&keyword=test&format=json&hits=1
→ HTTP 400
→ {"error_description":"specify valid applicationId","error":"wrong_parameter"}
```

この結果は production で起きていたエラーと**完全に一致**する。
楽天 API は `applicationId` パラメータ自体は認識しており（パラメータ名が誤っていれば別のエラーになる）、
**値が有効な applicationId でない**場合にこのエラーを返す。

→ **根本原因：Vercel に設定された `RAKUTEN_APP_ID` の値が、楽天で有効な applicationId として認識されていない。**

## 4. Vercel env の存在確認

- Vercel CLI は本マシンに**未インストール**のため、`vercel env ls` での存在確認は実施できなかった。
- 値の確認は不要かつ禁止（秘密値）。本記録にも値は一切記載しない。
- production が「未設定の警告（link_only・"RAKUTEN_APP_ID が未設定です"）」ではなく
  「HTTP 400 wrong_parameter」を出していた事実から、**env 自体は存在していたが値が無効**だったと判断できる。
  （未設定なら adapter は 64–78 行の「未設定」分岐に入り、400 は発生しない。）

## 5. コード修正の有無

**コード修正なし。** 上記の通りコード側は正しく、修正は不要。
credential 値をコードに直書きすることも禁止のため行わない。

## 6. 検証結果（本セッション・2026-05-25）

| 項目 | 結果 |
|---|---|
| `npm run lint` | ✅ PASS（exit 0）|
| `npx tsc --noEmit` | ✅ PASS（exit 0）|
| `npm run build` | ✅ PASS（exit 0・21 routes）|
| `npm test` | スクリプト無し（package.json は dev/build/start/lint のみ）→ 実行せず |
| live-check-runner | **未実行**：他 Claude セッション稼働 + Chrome CDP 9222 占有のため Single Writer Rule に従い起動せず。WebFetch + curl で代替確認 |

### production 確認（WebFetch / curl）

| URL | 結果 |
|---|---|
| `/search?q=ワイヤレスイヤホン` | 楽天は **link_only fallback**（「楽天市場で検索」ボタンのみ・商品カードなし）。エラー UI 漏れなし。Amazon/SHEIN/AliExpress/Temu は正常表示 |
| `/search?q=スマホケース` | 同上（楽天 link_only・他ショップ正常）|
| `/admin/click-stats` | 匿名アクセスでログインガード（「管理者アカウントでログイン」）正常 |
| 楽天 API（ダミー id 直叩き）| HTTP 400 `wrong_parameter` / `specify valid applicationId`（本番エラーと一致）|

## 7. real API は復旧したか

**未復旧。** 楽天は引き続き link_only fallback。
production は壊れていない（他ショップ正常・エラー UI 漏れなし）が、楽天の実商品表示は出ていない。
これはコードの問題ではなく、**Vercel の `RAKUTEN_APP_ID` 値が無効**であることが原因。

## 8. 残タスク（人側作業が必須）

Claude 側で完結できない（有効な credential が必要なため）。人側で以下を実施する。

1. **楽天ウェブサービスにログイン** — https://webservice.rakuten.co.jp/
2. **アプリID（applicationId）を確認** — アプリ一覧で有効な applicationId を確認。
   未作成ならアプリ登録（無料・即日発行）。Application Secret ではなく **applicationId** を使う。
   - ドキュメント: https://webservice.rakuten.co.jp/documentation/ichiba-item-search
   - テストフォーム: https://webservice.rakuten.co.jp/explorer/api （applicationId を入れて 200 が返るか確認できる）
3. **Vercel の production 環境変数を更新**
   - project: `cheap-cross-search`
   - env name: `RAKUTEN_APP_ID`
   - value: 楽天で確認した有効な applicationId（**チャット・ログ・Markdown に貼らない**）
   - environment: Production（必要なら Preview / Development も同じ値）
4. **redeploy**
   - Vercel Dashboard の Deployments → 最新を Redeploy、または再 push で再デプロイ
5. redeploy 後、`/search?q=ワイヤレスイヤホン` で楽天が商品カード（タイトル・価格・商品リンク）を表示するか確認。
   - 表示されれば real API 復旧。
   - 引き続き「楽天市場で検索」ボタンのみなら、applicationId がまだ無効 → 手順 2 を再確認。

> **補足:** 値が有効かどうかは、上記テストフォーム（手順 2）で applicationId を入れて
> 商品 JSON（200）が返るか先に確認すると、Vercel 更新前に切り分けできる。

## 9. 確定事項まとめ

- コード（endpoint / parameter / encode / env 参照 / fallback / registry 配線）はすべて正しい。
- 失敗原因は Vercel の `RAKUTEN_APP_ID` 値が無効。
- 修正は人側（楽天で有効な applicationId 確認 → Vercel 更新 → redeploy）。
- それまでは link_only fallback で安全に運用継続（production は壊れていない）。

## 10. 自動実施の試行結果（2026-05-25・認証で停止）

「人側で行う予定だった作業（楽天 applicationId 確認 → API Test Form 検証 → Vercel env 更新 → redeploy → production 確認）」を
Claude 側で可能な範囲まで自動実施しようとしたが、**すべての実行ステップが認証の壁で実施不可**だった。

### 試行と停止理由

| 手順 | 結果 | 停止理由 |
|---|---|---|
| 1. 楽天 Application ID の確認 | ❌ 実施不可 | 楽天ウェブサービス（https://webservice.rakuten.co.jp/app/list 等）は**ログイン必須**。Claude にはユーザーの楽天アカウントにログインしたブラウザがなく、ログイン情報も持たない |
| 2. API Test Form で有効性確認 | ❌ 実施不可 | テストには有効な applicationId の**値**が必要だが、値を保有していない（ローカルに `.env.local` なし・コードにも秘密値なし＝正しい状態）。値の捏造・秘密値の探索はしない |
| 3. Vercel env `RAKUTEN_APP_ID` 更新 | ❌ 実施不可 | Vercel は**ログイン必須**。`vercel` CLI 未インストール・`VERCEL_TOKEN` 環境変数なし＝非対話の API 経路もない。かつ設定すべき有効値を保有していない |
| 4. Production redeploy | ❌ 実施不可 | Vercel 認証が必要（手順3と同じ）|
| 5. production 確認 | ⭕ 実施（ただし変更前）| WebFetch で確認 → 楽天は依然 **link_only fallback**（手順1〜4 が未実施のため当然）|

### 環境確認（値は非表示・存在のみ）

- `.env.local`: **存在しない**（fresh clone のまま）
- `VERCEL_TOKEN`: 環境変数に**なし**
- `vercel` CLI: **未インストール**
- → Claude が非対話で実施できる経路は存在しない。

### 検証（本セッション・2026-05-25）

- `npm run lint` ✅ exit 0 / `npx tsc --noEmit` ✅ exit 0 / `npm run build` ✅ exit 0（コード変更なし）
- live-check-runner: 他 Claude セッション稼働 + Chrome CDP 9222 占有のため Single Writer Rule に従い未起動。WebFetch で代替確認。
- production `/search?q=ワイヤレスイヤホン`: 楽天 link_only fallback（商品カードなし・他ショップ正常・エラー UI 漏れなし）。

### この作業で Claude が行わなかったこと（方針）

- 認証突破・ログインの自動化は行わない。
- 秘密値（applicationId / token / password / OTP）の表示・記録・コード直書きはしない。
- repo 内の秘密値探索や、値の捏造はしない。

### 人側に残った作業（これが完了すると real_api 復旧）

§8 の手順1〜5 を**ユーザーがブラウザ上で直接**実施する必要がある（要約）:

1. https://webservice.rakuten.co.jp/ にログインし、有効な **applicationId** を確認
2. https://webservice.rakuten.co.jp/explorer/api の Ichiba Item Search で `keyword=ワイヤレスイヤホン` + applicationId を入れ、200 で商品が返るか確認
3. https://vercel.com/ → project `cheap-cross-search` → Settings → Environment Variables → `RAKUTEN_APP_ID`（Production）を有効値に更新（値はどこにも貼らない）
4. 最新 Production deployment を Redeploy（READY まで）
5. https://cheap-cross-search.vercel.app/search?q=ワイヤレスイヤホン で楽天が商品カード表示になれば復旧

> 認証完了後（= ユーザーが手順3・4 を実施した後）に Claude 側で再開できる作業: production 確認（WebFetch / live-check-runner）→ real_api 復旧の有無を判定 → 本ドキュメント・PROJECT_STATUS・ROADMAP を「復旧済み」に更新 → commit / push。再開時は「Vercel env 更新 + redeploy 済み」とだけ伝えてもらえればよい（値は不要）。

## 11. 復旧確認（2026-05-25・env 更新+redeploy 後）⚠️ 未復旧

ユーザーが「Vercel Production env `RAKUTEN_APP_ID` を有効値に更新し、最新 Production deployment を Redeploy 済み」と報告。
これを受けて production を確認した結果、**楽天は依然 link_only fallback のままで real_api は復旧していない**。

### 確認方法と証拠（curl で SSR 生 HTML を直接検査・WebFetch キャッシュ回避）

- 応答ヘッダ: `HTTP/1.1 200` / `X-Vercel-Cache: MISS` / `Age: 0` / `Cache-Control: no-store` → **CDN キャッシュではない新鮮な SSR レンダ**を確認。
- 楽天の唯一のリンクは `shop=rakuten&to=https://search.rakuten.co.jp/search/mall/.../&source=direct_search`
  = **link_only fallback の検索ボタン**（楽天の*検索*ページ向け・`offerId` なし）。
- 実商品オファーの指標（`offerId=rakuten-…` / `item.rakuten.co.jp` の商品ページリンク）は **0 件**。
- 5 回・3 クエリ（ワイヤレスイヤホン×3 / スマホケース / 本）で連続確認 → realOffers=0 で一定。**一過性タイムアウトではない**。
- 比較: Amazon カードは `offerId=demo-amazon-*`（デモデータ）で正常表示。他ショップ表示・UI ともに破損なし。
- 楽天の masked エラー文言は `warnings` に入るが **DOM/HTML には serialize されない**ため、外部からは server 側の失敗理由までは取得できなかった。

### 解釈（原因は依然 server 側＝Vercel runtime）

楽天アダプタは production で実行され、内部でエラー or 設定不備となり link_only にフォールバックしている。
ユーザーが API Test Form で値の有効性を確認済みなら「値そのもの」は正しい可能性が高く、
**production runtime にその有効値が届いていない／反映されていない**ことが疑われる。候補:

1. env の Environment が **Production になっていない**（Preview/Development のみ等）
2. **production alias が旧 deployment を指している**（Redeploy が Production に promote されていない／まだ READY でない）
3. Vercel に貼った値に**前後の空白・改行混入**（explorer では正しい値でテストし、Vercel 側だけ不正）
4. その他 runtime エラー

### 切り分けの決定打（人側・Vercel ログ）

Vercel → 当該 Production deployment → **Runtime Logs / Functions Logs** で `[rakuten]` を検索する。
出力されるメッセージ（applicationId はコード側で MASKED 済み・共有しても秘密漏れなし）で分岐が確定する:

- `RAKUTEN_APP_ID が未設定です` → runtime に env が届いていない（候補1・2）
- `API エラーのため外部検索フォールバック: ... HTTP 400 ... specify valid applicationId` → 値は届いているが無効（候補3）
- 別の HTTP エラー → その内容で判断

### 人側に依頼する確認・対応

1. Vercel env `RAKUTEN_APP_ID` の **Environment に Production が含まれる**ことを確認
2. **Redeploy が Production deployment として READY**（production alias が指す最新）になっていることを確認。
   不安なら "Use existing Build Cache" を外して再 Redeploy
3. 値に**前後の空白・改行**が無いことを確認（applicationId であり Application Secret ではない）
4. 上記 Runtime Logs の `[rakuten]` 行を確認（masked なので内容は共有可）
5. 修正後に「再度 redeploy 済み」と一報 → Claude 側で再確認

> 本確認時点では **Phase 23B は CLOSE しない**（real_api 未復旧）。production は破損しておらず link_only fallback で安全稼働中。

## 12. 復旧確認（2回目・値を再貼り付け+redeploy 後）⚠️ なお未復旧

ユーザーが「Vercel Production `RAKUTEN_APP_ID` を楽天 Developers 画面のアプリケーションID に前後空白・改行なしで貼り直し、Production を Redeploy → Ready」と報告。再確認した結果も **未復旧**。

- 確認: curl 生 SSR HTML・`X-Vercel-Cache: MISS` / `Age: 0`（新鮮なレンダ）。
- 楽天 realOffers=0 / itemPageLinks=0 / searchFallback あり を **3 クエリ**（ワイヤレスイヤホン・スマホケース・本）で確認。依然 link_only fallback。

### 重要な仮説：楽天「ポータルの取り違え」

ユーザーは「**楽天 Developers 画面**のアプリケーションID」と報告。本アプリが使う Ichiba Item Search API は
**楽天ウェブサービス（webservice.rakuten.co.jp）**専用の applicationId が必要で、楽天 Developers / RMS とは別系統。
別ポータルの applicationId を貼ると、見た目は有効でも `specify valid applicationId` で弾かれる可能性がある。
→ webservice.rakuten.co.jp のアプリ一覧の applicationId か、その API Explorer（/explorer/api）の IchibaItem Search で 200+商品が返る値か、を要確認。

### 採用した切り分け方法（ユーザー選択）

**Vercel Runtime/Functions Logs の `[rakuten]` 行**を確認する（applicationId はコード側で MASKED 済み・共有可）。
- `RAKUTEN_APP_ID が未設定です` → env が runtime に届いていない（scope=Production か / redeploy promote 済みか）
- `... HTTP 400 ... specify valid applicationId` → 値が無効（→ §12 のポータル取り違え仮説へ。webservice.rakuten.co.jp の applicationId を取得し直す）
- 別エラー → 内容で判断

ログだけで判らない場合は、masked 診断エンドポイント（`/api/diag/rakuten`）追加に進む。

> **Phase 23B は引き続き OPEN。** 次アクション = ユーザーが `[rakuten]` ログ行を共有 → Claude が原因特定。

## 13. 根本原因の確定と新仕様（2026-04-01）対応 — Phase 23C（2026-05-25）

### 根本原因（確定）

Vercel Runtime Logs で `RAKUTEN_APP_ID` は runtime に届いていたが、楽天 API が
`HTTP 400 {"error":"wrong_parameter","error_description":"specify valid applicationId"}` を返していた。
人側で楽天 Developers / Rakuten Web Service のアプリ一覧を確認したところ、画面には
**「アプリケーションID」「アクセスキー」「アフィリエイトID」**の3点があった。

→ **原因は「旧 endpoint + applicationId のみ」で実装していたこと。**
楽天市場商品検索APIは現行 **version 2026-04-01** で、新プラットフォーム（`openapi.rakuten.co.jp`）+
**accessKey 必須**に変わっていた。旧実装の applicationId 単独リクエストは valid と認識されなかった。

### ライブ検証（新 endpoint・ダミー値・秘密なし）

```
GET https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?applicationId=<dummy>&keyword=test&hits=1&formatVersion=2
→ 400 {"errors":{"errorCode":400,"errorMessage":"accessKey must be present as a query parameter or in the header"}}

GET 同上 + &accessKey=<dummy>
→ 403 {"errors":{"errorCode":403,"errorMessage":"Invalid Access Key"}}

GET 同上 + imageFlag=1&sort=standard（accessKey なし）
→ 400 accessKey must be present（= imageFlag/sort/formatVersion は受理）
```

→ 新 endpoint は稼働中・**applicationId + accessKey 必須**・accessKey は query で受理・
パラメータ（keyword/hits/imageFlag/sort/formatVersion）は妥当・エラー形式は `errors.errorCode/errorMessage`。

### 公式ドキュメント確認（2026-04-01・formatVersion=2）

- 成功レスポンスは `{"items":[{ itemName, itemPrice, ... }]}`（**lowercase `items`・フィールドは各要素直下にフラット**）。
- `mediumImageUrls` は**文字列URLの配列**（128x128）。
- `applicationId` と `accessKey` は**必須**、`affiliateId` は**任意**（設定すると `affiliateUrl` が返る）。

### 実装変更（コード）

| ファイル | 変更 |
|---|---|
| `src/lib/search/adapters/rakuten-ichiba.ts` | endpoint を `openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401` に変更。`accessKey`（query）と任意 `affiliateId` を送信。`formatVersion=2`。レスポンスを v2（`items` フラット・画像は文字列配列）へ対応しつつ旧形式（`Items`/`Item` 入れ子・`{imageUrl}`）も後方互換で許容。新エラー形式 `errors.errorCode/errorMessage` と旧 `error/error_description` の両対応。`applicationId`/`accessKey` を `maskSecrets()` で全ログ masked。env 未設定（appId or accessKey 欠）時は link_only・API エラー時も link_only（UI に漏らさない）|
| `.env.local.example` | `RAKUTEN_ACCESS_KEY`（必須）・`RAKUTEN_AFFILIATE_ID`（任意）を変数名のみ追記。`RAKUTEN_APP_ID` の説明更新 |
| `src/lib/shops/shops.ts` | 楽天 `affiliateNote` を 2026-04-01 仕様（applicationId + accessKey 必須）に更新 |

### 検証（本セッション・2026-05-25）

- `npm run lint` ✅ exit 0 / `npx tsc --noEmit` ✅ exit 0 / `npm run build` ✅ exit 0（21 routes）
- 新 endpoint のダミー値検証で request shape・必須パラメータ・エラー形式を確認済み（上記）。
- live-check-runner: 他 Claude セッション + CDP 9222 占有のため未起動。production 確認は env 追加 + redeploy 後に curl/WebFetch で実施予定。

### 人側に必要な作業（これで real_api 復旧する想定）

1. Vercel → project `cheap-cross-search` → Settings → Environment Variables
   - **追加** `RAKUTEN_ACCESS_KEY` = 楽天アプリ一覧の「アクセスキー」 / Environment: **Production**
   - 既存 `RAKUTEN_APP_ID` = 「アプリケーションID」（そのまま）
   - 任意 `RAKUTEN_AFFILIATE_ID` = 「アフィリエイトID」（収益化する場合）
   - ※値はチャット・Markdown に貼らない
2. Production を **Redeploy**（READY まで）
3. 完了後に一報 → Claude が production 確認（下記 URL）→ 復旧していれば Phase 23C/23B を CLOSE
   - https://cheap-cross-search.vercel.app/search?q=ワイヤレスイヤホン
   - https://cheap-cross-search.vercel.app/search?q=スマホケース

### Phase 状態

- **Phase 23C（新仕様対応・実装）= 完了（commit 済み）。**
- **Phase 23B（real_api 復旧）= OPEN 継続**（人側 env 追加 + redeploy 待ち → production 確認で CLOSE 判定）。

## 14. 真因の発見：Production が古い commit を配信していた（2026-05-25）

ユーザーが `RAKUTEN_ACCESS_KEY` を Vercel Production に追加し Redeploy 後、Vercel の Deployment Details の
**Source が `6cbef8e` のまま**（最新 `7150d3a` ではない）であることに気づいた。これが全ての失敗の真因。

### 確認結果（git）

- 最新 `7150d3a` は origin に push 済み（HEAD == origin == 7150d3a）。
- `6cbef8e` は `7150d3a` の**祖先**（`merge-base --is-ancestor` = 0）。内容は Phase 23A（2026-05-24）の
  **旧 endpoint `app.rakuten.co.jp/services/api/IchibaItem/Search/20220601`・accessKey なし**のコード。
- `6cbef8e..7150d3a` の間に **9 commits**（うち `7150d3a` が新仕様アダプタ本体）。
  → **Production は新仕様アダプタを一度も載せていなかった。**

### これが意味すること

これまでの env 変更（`RAKUTEN_APP_ID` 貼り直し → `RAKUTEN_ACCESS_KEY` 追加）が production の挙動を
変えなかったのは当然で、**production は終始 6cbef8e（accessKey 非対応・旧 endpoint）を実行していた**ため。
Deployment 一覧で 6cbef8e の deployment を「Redeploy」しても、同じ古い commit を再ビルドするだけで
最新コードは反映されない。

### なぜ最新が production に出ないか（推定）

- Vercel プロジェクトの **Production Branch が `feature/phase8-supabase-vercel` ではない**（例: `main`）ため、
  当該ブランチへの push が Production に自動反映されない、もしくは
- Git 連携が無効で、過去に 6cbef8e から作った deployment を手動 Redeploy し続けている。
- ローカル repo に `.vercel` リンク・`vercel.json` は無く、`VERCEL_TOKEN` も未設定 →
  **Claude からの CLI デプロイは認証（ログイン）と project link が必要で実施不可**（認証境界で停止）。

### 人側で必要な対応（最新 7150d3a を Production へ載せる）

いずれか一つ。**「6cbef8e の Redeploy」では直らない**点に注意。

1. **Production Branch を確認/変更**: Vercel → project `cheap-cross-search` → Settings → Git →
   **Production Branch** を `feature/phase8-supabase-vercel` にする。その後 push 済みの 7150d3a が
   Production としてビルドされる（必要なら空 commit を push、または Deployments から最新を再ビルド）。
2. **最新 commit の deployment を Promote**: Deployments で `7150d3a` から作られた（Preview）deployment を探し
   **Promote to Production**。無ければ Git 連携が当該ブランチを自動ビルドしていない → 手順1へ。
3. **Production Branch が `main` 運用なら**: `7150d3a` を `main` に merge して push（要・別途方針確認）。
4. **認証済み端末で Vercel CLI**: repo で `vercel link`（project 紐付け）→ `vercel --prod`
   （= 最新コードから Production deploy）。Claude 側は未認証のため実施不可。

### 確認の決定打

Production deployment の **Source（commit）が `7150d3a`** になっていること。
6cbef8e のままなら新仕様コードは動かない（楽天は link_only fallback のまま）。

> **Phase 23B/23C とも、production の Source が `7150d3a` になり再確認できるまで OPEN。**
> env（`RAKUTEN_APP_ID` + `RAKUTEN_ACCESS_KEY`）は設定済みなので、7150d3a が Production に載れば復旧する見込み。
