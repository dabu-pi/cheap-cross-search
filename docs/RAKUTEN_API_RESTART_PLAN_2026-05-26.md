# 楽天API復旧 再開プラン（2026-05-26 以降）

2026-05-25 の作業を一旦停止。本ファイルは**明日以降の再開手順**の単独まとめ。
詳細な調査ログは [`RAKUTEN_API_RECOVERY_2026-05-25.md`](./RAKUTEN_API_RECOVERY_2026-05-25.md)（§13〜§16）を参照。

## 1. 今日（2026-05-25）の最終状態

| 項目 | 状態 |
|---|---|
| 楽天 real API | ⚠️ **未復旧**（`403 REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING`）|
| Phase 23B（real_api 復旧）| 🔓 **OPEN** |
| Phase 23C（2026-04-01 新仕様アダプタ実装）| ✅ **実装完了**（本番デプロイ済み）|
| production | ✅ link_only fallback で**安全稼働**（楽天のみ商品カードなし・他ショップ/UI/admin gate 正常・エラー UI 漏れなし）|
| repo | HEAD `5140b87` / clean / ahead-behind 0-0 |
| 一時診断エンドポイント | ✅ 削除済み（`/api/diag/rakuten` は production で 404 確認済み）|

## 2. 今日までに完了したこと

- Vercel Production が古い commit `6cbef8e`（旧コード・accessKey 非対応）を配信していた問題を特定。
- Vercel CLI 認証後、`vercel link`（`katsushis-projects/cheap-cross-search`）→ `vercel --prod` で**最新コードを Production 化**。
- 楽天 API **2026-04-01 新仕様**対応:
  - new endpoint `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401`
  - `applicationId + accessKey` 対応（両方 Vercel Production env に設定済み）
  - `formatVersion=2` 対応
  - `Referer` を **node:https** で確実送信（fetch だと undici が forbidden header として除去するため）
- 一時診断（masked・確認後削除）で確定:
  - Vercel egress は Referer を送出している（echo 確認）。
  - 新endpoint は Referer 有/無で**同一**の `REFERRER_MISSING` → **リクエスト無関係＝楽天アカウント/アプリ設定側**。
  - 旧endpoint は現 applicationId で `specify valid applicationId` → 現 cred は新platform専用。
- lint / tsc / build PASS。

## 3. 未解決事項

- 楽天 API が `HTTP 403 REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING` を返し続ける。
- 楽天アプリ「ECサイト比較」に **許可されたWebサイト = `cheap-cross-search.vercel.app`** / アプリURL = `https://cheap-cross-search.vercel.app` を登録済みだが、登録直後の確認ではまだ 403。
- 推定: コード/Vercel/env ではなく、**楽天アプリ側の設定反映（伝播）待ち、または楽天アプリ設定/利用権限/context チェック側の問題**。

## 4. 明日以降の再開手順（優先順）

1. **時間を置いてから production 再確認**（設定伝播待ちが第一候補）:
   - https://cheap-cross-search.vercel.app/search?q=ワイヤレスイヤホン
   - https://cheap-cross-search.vercel.app/search?q=スマホケース
   - 楽天の**商品カード（商品名・価格・画像・楽天リンク）**が出れば復旧。
   - 判定の機械的指標: SSR HTML に `offerId=rakuten-…` / `item.rakuten.co.jp` が出現すれば real API。
     `search.rakuten.co.jp` の「楽天市場で検索」ボタンのみなら依然 link_only。
2. **Runtime Logs で `[rakuten]` を確認**（`vercel logs <prod-deployment-url> --json`・masked のみ）:
   - エラーが消えていれば復旧。
   - まだ `REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING` なら → 手順3。
3. **楽天アプリ設定を再確認**: 許可Webサイト/リファラー項目・アプリ種別・API 利用権限・server-to-server 可否。
4. **それでも解消しなければ楽天サポート問い合わせ**（§6 の要点を使用）。
5. **代替案**: 従来型 楽天ウェブサービス（webservice.rakuten.co.jp）の applicationId を取得できれば、
   旧endpoint `app.rakuten.co.jp/.../20220601` を accessKey/Referer 不要で server 側利用可能。
   その場合アダプタを旧endpoint対応に戻す小修正で対応（現 applicationId は旧endpointで無効なので別途発行が必要）。

## 5. 明日以降の Claude 再開メモ（プロンプト前提）

- 入口は本ファイルと `RAKUTEN_API_RECOVERY_2026-05-25.md`。「時間を置いたので再確認する」から始める。
- まず `git fetch` → `pull --ff-only` → status/HEAD/ahead-behind 確認。Single Writer 確認。
- 実機確認は **live-check-runner が使えれば使用**。
  - **CDP 9222 が占有中なら勝手に kill せず**、`curl` / WebFetch / `vercel logs` で代替（今日もこの方針）。
- **secrets（applicationId / accessKey / token 等）は表示・記録しない。** 値は不要（「設定した」「時間を置いた」の一報で足りる）。
- **一時診断エンドポイントは復活させない**（必要時は再度ユーザー承認を取り、確認後すぐ削除）。
- **復旧した場合**: `PROJECT_STATUS.md` / `ROADMAP.md` / `RAKUTEN_API_RECOVERY_2026-05-25.md` を **CLOSED** に更新（Phase 23B/23C CLOSE）。docs commit/push。
- **未復旧の場合**: OPEN 継続。§6 の楽天サポート問い合わせ準備を進める。
- 必要なら従来型 applicationId 取得後にアダプタを旧endpoint対応へ戻す小修正（lint/tsc/build → 本番デプロイ → 再確認）。

## 6. 楽天サポート問い合わせ時の要点（秘密値なし）

- 使用 endpoint: `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401`
- 認証: `applicationId` + `accessKey` を使用（両方とも有効と確認済み＝アクセスキー検証は通過している）。
- 送信している Referer: `https://cheap-cross-search.vercel.app/`
- アプリの「許可されたWebサイト」登録: `cheap-cross-search.vercel.app`
- 呼び出し元: Vercel の **server-side**（Node `node:https` で Referer を送信）。
- 検証: echo サービスで **Referer が送出されていることを確認済み**。
- 症状: それでも `HTTP 403 REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING` が返る。
  Referer の有無に関わらず同一エラー（リクエストの Referer と無関係に見える）。
- 質問: **server-to-server 利用時の正しいリファラー設定**、またはアプリ側に必要な**追加の許可設定/権限/反映待ち時間**はあるか。

## 7. 今日の主要 commit と意味

| commit | 意味 |
|---|---|
| `7150d3a` | 楽天API 2026-04-01 新仕様対応（new endpoint・accessKey・formatVersion=2）|
| `082b59e` | fetch で Referer 送信を試行 → Vercel/undici が forbidden header として除去・無効と判明 |
| `11163d4` | node:https で Referer を確実送信 |
| `288a16b` | docs 更新（本番最新化・referrer 登録要否の記録）|
| `5140b87` | referrer 登録後の未復旧確認・診断結果・今後方針を記録 |
| （本日終了）| 本ファイル作成 + 停止記録 |

> 一時診断エンドポイント `/api/diag/rakuten` は **commit していない**（untracked のまま削除）。production からも 404 で除去確認済み。
