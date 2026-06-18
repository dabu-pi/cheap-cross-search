# JBIZ事業トップ連携メモ（2026-06-18）

> JBIZ 名称・階層・役割分担の正本は hirayama-jyusei-strategy/docs/JBIZ_NAMING_AND_LAYER_RULES_2026-06-18.md。
> このプロジェクトはJBIZの一部。JBIZ起動ハブは軽量入口で、実務導線の本体は各事業トップに置く。
> このプロジェクトClaudeは JBIZ本体(gas/portal-gateway-v1.gs)を直接編集せず、ここに反映待ち情報を記録する。

## このプロジェクトのJBIZ上の位置づけ
- 事業トップ：EC / Webサービス トップ
- 表示区分：B/C（独立Webサービス）
- 技術種別：Next.js（16.2.6・App Router / TypeScript / Tailwind CSS 4・Supabase / Vercel・PWA）。6ショップ価格比較（Amazon / SHEIN / AliExpress / Temu / 楽天市場 / Yahoo!ショッピング）。
- JBIZ起動ハブ表面に出すべきか：出す（本番公開済み・誰でもアクセス可の公開Webサービス。1〜2リンクのみ・KPIや実務導線は事業トップに寄せる）
- 理由：本番稼働中（https://cheap-cross-search.vercel.app）で外部公開済みの独立Webサービス。平山が日常的に「サイトを開く」「管理画面でクリック統計を見る」入口が要る。ただし管理統計・取得アダプタ状態・申請進捗など実務情報は重いため起動ハブには出さず事業トップに集約する。

## この事業トップに置くべき機能
- 毎日使う入口：公開サイトトップ（`/`）／検索結果（`/search?q=...`）の確認入口
- たまに使う入口：管理画面トップ（`/admin`）／クリック統計（`/admin/click-stats`）／問題報告一覧の確認（`/report` 経由でDB蓄積）／アフィリエイト設定（`/admin/affiliate`）
- 今日見るもの：クリック統計（`/admin/click-stats`・総クリック数 / 今日(JST) / 7日間 / ショップ別 / 上位クエリ）
- KPI：クリック数（総 / 今日 / 7日間）・ショップ別クリック内訳・上位検索クエリ・アフィリエイト収益導線（Amazon承認済み `cheapc***-22`、他ショップは申請段階）
- 人の確認待ち：楽天市場 real_api 復旧（Phase 23B/23C OPEN・楽天アカウント/アプリ設定の伝播待ち or 従来型applicationId取得・楽天サポート問い合わせ）／AliExpress Portals 再申請（HOLD・サイト運用実績と運営者情報整備後）／SHEIN・Temu アフィリエイト申請（準備完了・未申請）
- 次にやること：楽天API再開手順（`docs/RAKUTEN_API_RESTART_PLAN_2026-05-26.md`）に沿った再確認・SHEIN(A8.net) / Temu アフィリエイト申請・Amazon PA-API 有効化（売上3件達成後）

## JBIZ起動ハブ表面に出す直リンク候補（原則3〜5個）
- ECサイト比較.com 公開サイト → https://cheap-cross-search.vercel.app
- 管理画面（クリック統計など） → https://cheap-cross-search.vercel.app/admin

## 事業トップ内に置く導線
- 公開サイトトップ：https://cheap-cross-search.vercel.app/
- 検索結果（例）：https://cheap-cross-search.vercel.app/search?q=スマホケース
- 管理ダッシュボード：https://cheap-cross-search.vercel.app/admin
- クリック統計：https://cheap-cross-search.vercel.app/admin/click-stats
- アフィリエイト設定：https://cheap-cross-search.vercel.app/admin/affiliate
- ショップ管理：https://cheap-cross-search.vercel.app/admin/shops
- 除外キーワード管理：https://cheap-cross-search.vercel.app/admin/blocked-keywords
- 取得ログ：https://cheap-cross-search.vercel.app/admin/fetch-logs
- ポリシー類：/terms /privacy /safety-policy /disclaimer
- ※ /admin 系は管理者ログイン（Supabase admin_users）が前提。一般公開しない。

## Homeから移した方がよい情報
- クリック統計の数値（総 / 今日 / 7日間 / ショップ別 / 上位クエリ）→ 動的KPIなので Home に出さず事業トップ（または `/admin/click-stats` リンク）に寄せる
- 6ショップのアダプタ状態・アフィリエイト承認状況（Amazon承認 / AliExpress不承認HOLD / SHEIN・Temu未申請 / 楽天 real_api未復旧 / Yahoo!未設定）→ Home ではなく事業トップの「KPI / 人の確認待ち」に集約
- 楽天API復旧ブロッカーの詳細（Phase 23系の長文経緯）→ Home に出さず docs と事業トップの「人の確認待ち」に集約

## 開発者向け詳細に隠すもの
- GitHub: https://github.com/dabu-pi/cheap-cross-search
- local path: C:/hirayama-ai-workspace/workspace/cheap-cross-search
- branch: feature/phase8-supabase-vercel
- Run_Log: workspace の logs/runlog/（de コマンド出力）。本プロジェクト個別の Run_Log シート行は未確認（要確認）
- PROJECT_STATUS: C:/hirayama-ai-workspace/workspace/cheap-cross-search/PROJECT_STATUS.md
- Claude再開情報: PROJECT_STATUS.md 冒頭の「次回再開時の最優先作業」／ROADMAP.md 冒頭の復元メモ／`docs/RAKUTEN_API_RESTART_PLAN_2026-05-26.md`／`docs/TRANSFER_TO_NEW_PC_2026-05-25.md`。検証は npm ci → npm run lint → tsc → npm run build → production smoke。

## JBIZ Claudeへ渡す反映情報
- 起動ハブへ追加したいボタン：「ECサイト比較.com（公開サイト）」→ https://cheap-cross-search.vercel.app ／「ECサイト比較.com 管理画面」→ https://cheap-cross-search.vercel.app/admin
- 事業トップへ追加したい導線：公開トップ / 検索 / 管理ダッシュボード / クリック統計 / アフィリエイト設定 / ショップ管理 / 除外キーワード / 取得ログ / ポリシー類（上記「事業トップ内に置く導線」一覧）
- 注意すべきURL drift：本番URLは Vercel エイリアス `https://cheap-cross-search.vercel.app`（カスタムドメイン未設定＝独自ドメイン化したら要更新）。deployment 固有URL（dpl_xxx / *.vercel.app のハッシュ付き）は本番リンクに使わない。Business_Links / resolver には固定エイリアスのみ登録する。
- 外部URL / 内部view / resolver利用の注意：これは JBIZ(GAS) 外部の独立 Vercel Webサービス。JBIZ 側は getExternalPortalUrl_ / Business_Links / ?view= resolver 経由で外部URLとして解決し、ハードコードした deploymentId URL は使わない。GAS の access:MYSELF 等とは無関係（普通の公開HTTPS）。
- 重い処理：クリック統計（`/admin/click-stats`）は Supabase へのクエリ（click_events 集計）が走る。検索（`/search`）も6ショップ並列処理＋安全フィルター。いずれも JBIZ起動ハブからは直叩きせず、事業トップ経由のリンクで開く（起動ハブは軽量入口を維持）。
- 人の確認事項：(1) 楽天 real_api 復旧（人側のブラウザ操作＝楽天アプリ設定確認 + Vercel env + redeploy / サポート問い合わせ）(2) AliExpress 再申請可否 (3) SHEIN(A8.net) / Temu アフィリエイト申請 (4) 独自ドメイン取得有無（取得すれば全リンク更新）(5) Vercel の現行本番URL が `https://cheap-cross-search.vercel.app` のままか（要確認）

## 次にこのプロジェクトClaudeがやること
- 本ハンドオフを JBIZ Claude が起動ハブ／事業トップに反映するのを待つ（JBIZ本体は本プロジェクトから直接編集しない）
- 楽天API再開は `docs/RAKUTEN_API_RESTART_PLAN_2026-05-26.md` に従い、人側の楽天/Vercel 操作後に再確認する
- アフィリエイト申請（SHEIN / Temu）と AliExpress 再申請の判断を人と確認してから進める
- 本番URLが Vercel エイリアスのままか／独自ドメイン化したかを確認し、変われば Business_Links と本メモの直リンクを更新する
