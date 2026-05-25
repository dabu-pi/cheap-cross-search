# 新PC復元レポート — ECサイト比較.com（2026-05-25）

旧PC → 新PC への引き継ぎ・動作確認の記録。

## 復元元・復元先

| 項目 | 内容 |
|---|---|
| サービス名 | ECサイト比較.com |
| 新PC repo path | `C:\hirayama-ai-workspace\workspace\cheap-cross-search` |
| remote | `https://github.com/dabu-pi/cheap-cross-search.git`（dabu-pi 配下）|
| branch | `feature/phase8-supabase-vercel` |
| 復元方法 | GitHub から fresh clone（旧PCコピーフォルダは新PC上に未配置だったため、GitHub 正本を clone）|
| clone 後 HEAD | `764a101` |
| clean / ahead-behind | clean / 0-0 |
| production URL | https://cheap-cross-search.vercel.app |
| production deploy ID | dpl_5Nvk24wASG4NNcyqF5o7suPrnF9f（Phase 23A・READY）|

> **HEAD の注記:** 引き継ぎメモの「最新確認済み HEAD: bdfdb67」は GitHub remote tip と一致しなかった。
> remote `feature/phase8-supabase-vercel` の tip は `764a101`。`bdfdb67` は旧PCローカルのみで push されていない、
> もしくはより古いコミットの可能性がある。GitHub を正本とし `764a101` で復元した。
> 旧PCに未 push の `bdfdb67` 以降の変更がある場合は、旧PCで `git log` / `git status` を確認し push が必要。

## 環境

| 項目 | 値 |
|---|---|
| Node | v24.14.0 |
| npm | 11.9.0 |
| Next.js | 16.2.6（Turbopack）|

## 検証結果（新PC・2026-05-25）

| 項目 | 結果 |
|---|---|
| `npm ci` | ✅ 成功（634 packages・lockfile 準拠）|
| `npm run lint`（eslint）| ✅ PASS（exit 0・警告なし）|
| `npx tsc --noEmit`（typecheck）| ✅ PASS（exit 0）|
| `npm run build`（next build）| ✅ PASS（exit 0・21 routes 生成）|
| live-check-runner | ⏭ 今回スキップ（理由は下記）|

> `package.json` に `typecheck` script は無いため `npx tsc --noEmit` を使用。
> `npm ci` で audit vulnerabilities 7件（moderate 2 / high 5）が報告されたが、
> lockfile を書き換える `npm audit fix` は今回実施していない（別途判断）。

### production smoke（WebFetch・2026-05-25）

| URL | 結果 |
|---|---|
| `/`（トップ）| ✅ 「ECサイト比較.com」表示・6ショップ横断比較・外部検索モード |
| `/search?q=ワイヤレスイヤホン` | ✅ 10件・Amazon/楽天/Yahoo/SHEIN/AliExpress/Temu 表示・参考価格帯/ソート |
| `/search?q=スマホケース` | ✅ 10件・6ショップ・安全フィルター通知・ソート/フィルター動作 |
| `/admin/click-stats` | ✅ 匿名は「🔒 管理者ログインが必要です」でガード（アクセス制御 OK）|

### live-check-runner をスキップした理由（Single Writer Rule）

復元作業開始時のプロセス確認で以下を検知したため、共有リソースである
`tools/live-check-runner/` と Chrome CDP を使う検証は実施しなかった。

- `claude.exe` が3プロセス稼働（本セッション含む → 他に2セッション稼働中）
- Chrome CDP port **9222 が別 Chrome プロセス（PID 21700）に占有**されていた

`tools/live-check-runner/` / `auth.json` / Chrome CDP 9222 は workspace の single-writer 共有資源であり、
他セッションが使用中の可能性があるため、`npm run test:*` の起動・Chrome の kill は行わなかった。
代替として production smoke を WebFetch で実施し、回帰の主要導線を確認した。

> live-check-runner での回帰確認が必要な場合は、他 Claude セッション停止 + 9222 の Chrome 解放を確認後に
> single-writer で `tools/live-check-runner/` の cheap-cross-search Phase 20A/21/22/23 系 spec を実行する。

## local-only ファイルの扱い

| ファイル | 扱い |
|---|---|
| `.env.local` | 新PC repo に**未配置**（fresh clone・.gitignore 除外）。値は一切表示していない |
| `.env.local.example` | repo に存在（変数名テンプレートのみ・秘密値なし）|

- Vercel / Supabase / Rakuten / Amazon affiliate の秘密値は**一切表示・記録していない**。
- ローカルで Supabase 連携や real API を動かす場合は、`.env.local.example` を基に `.env.local` を
  repo root に手動配置する必要がある（本番 Vercel 側には環境変数設定済み）。

## 新PCでの作業再開可否

✅ **再開可能。** clone・install・lint・typecheck・build・production smoke すべて成功。

ローカルで DB/認証/real API を伴う動作確認をする場合のみ `.env.local` の配置が追加で必要
（build / lint / typecheck / production smoke は `.env.local` なしで通る）。

## 残タスク（引き継ぎ）

1. ⚠️ **楽天 `RAKUTEN_APP_ID` 修正** — 現在 invalid で real_api 未完了・link_only fallback 済み。
   https://webservice.rakuten.co.jp/ で正しい applicationId を確認 → Vercel の値を更新 → redeploy で real_api 有効化。
2. ⏳ **AliExpress Portals 審査待ち**（Submitted 2026-05-23）— 承認メール後 `docs/ADAPTER_DEVELOPMENT_GUIDE.md` 手順で実装。
3. 🔜 **Amazon PA-API** — 売上3件達成後に有効化（`ADAPTER_DEVELOPMENT_GUIDE.md` 手順）。
4. （任意）旧PCに未 push の `bdfdb67` 以降の変更が無いか確認。
