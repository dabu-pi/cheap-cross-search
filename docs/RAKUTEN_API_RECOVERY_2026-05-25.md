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
