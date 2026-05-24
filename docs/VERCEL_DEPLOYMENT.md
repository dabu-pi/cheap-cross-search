# Vercel デプロイ手順 — 安買い横断サーチ

最終更新: 2026-05-24（Phase 9 本番確認完了）

---

## 前提条件

以下が完了していること:

| 条件 | 確認方法 |
|---|---|
| Supabase プロジェクト作成済み | `SUPABASE_SETUP.md` Step 1 完了 |
| `0001_auth_favorites.sql` 適用済み | Supabase > SQL Editor で実行済み |
| `0002_tracking_reports_admin.sql` 適用済み | 同上 |
| Google OAuth 設定済み（任意） | `SUPABASE_SETUP.md` Step 4 完了 |
| GitHub リポジトリ（または Vercel へのアクセス権）| — |

---

## Step 1: Vercel プロジェクト作成

1. [https://vercel.com/](https://vercel.com/) にログイン
2. **Add New > Project**
3. Git リポジトリをインポート（またはローカルからデプロイ）
4. **Framework Preset**: Next.js（自動検出）
5. **Root Directory**: `cheap-cross-search`（モノレポの場合）
6. **Build Command**: `npm run build`（デフォルト）
7. **Output Directory**: `.next`（デフォルト）

---

## Step 2: 環境変数設定

Vercel プロジェクト設定 > **Settings > Environment Variables** に追加:

| 変数名 | 値 | 備考 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase > Settings > API > anon / public |

⚠️ **絶対に追加しないもの:**
- `service_role` キー（管理者権限。フロントエンドに渡すと全データが漏洩）
- アフィリエイト ID（Supabase DB のみで管理）
- その他の秘密情報

---

## Step 3: Supabase Redirect URL 追加

Vercel デプロイ後に発行される URL（例: `https://cheap-cross-search-xxxx.vercel.app`）を取得し、以下に追加する:

### Supabase ダッシュボード > Authentication > URL Configuration

```
Redirect URLs:
  http://localhost:3000/auth/callback       ← ローカル開発用（既存）
  https://<your-app>.vercel.app/auth/callback  ← 本番用（追加）
```

### Google Cloud Console（Google OAuth を使う場合）

- **OAuth クライアント** > **承認済みのリダイレクト URI** に追加:
  ```
  https://xxxxx.supabase.co/auth/v1/callback
  ```
  （既に追加済みであれば不要）

---

## Step 4: デプロイ実行

```powershell
# ローカルから Vercel CLI でデプロイ（推奨）
cd C:\hirayama-ai-workspace\workspace\cheap-cross-search
npx vercel --prod

# または GitHub 連携の場合は push するだけ
git push origin feature/phase8-supabase-vercel
# → Vercel が自動でビルド・デプロイする
```

---

## Step 5: デプロイ後確認

デプロイ完了後、以下の URL を確認する（`<BASE_URL>` を実際の Vercel URL に置き換え）:

| URL | 期待する動作 |
|---|---|
| `<BASE_URL>/` | トップページ表示・フッターナビあり |
| `<BASE_URL>/search?q=スマホケース` | 検索結果・安全フィルターバナー |
| `<BASE_URL>/terms` | 利用規約ページ表示 |
| `<BASE_URL>/privacy` | プライバシーポリシー表示 |
| `<BASE_URL>/safety-policy` | 安全ポリシー表示 |
| `<BASE_URL>/report` | 問題報告ページ表示 |
| `<BASE_URL>/login` | ログインフォーム表示（Supabase 設定済みなら認証機能あり）|
| `<BASE_URL>/admin` | 管理画面トップ |
| `<BASE_URL>/admin/blocked-keywords` | 稼働中ルール表示 |
| `<BASE_URL>/api/click?shop=amazon&to=https://www.amazon.co.jp/dp/test` | 302 リダイレクト（クリック計測）|

---

## Step 6: 管理者ユーザー登録

本番 Supabase で管理者を登録する手順:

1. `<BASE_URL>/login` でアカウント作成（またはログイン）
2. Supabase ダッシュボード > **Authentication > Users** でユーザーの UUID を確認
3. **SQL Editor** で以下を実行（`<USER_UUID>` を実際の UUID に置き換え）:

```sql
insert into public.admin_users (user_id, role, notes)
values ('<USER_UUID>', 'admin', '平山克司（サービス管理者）');
```

4. 管理者ユーザーで `/admin` にアクセスし、管理画面が正常に表示されることを確認

---

## Step 7: アフィリエイト ID 設定（申請後）

アフィリエイトプログラム参加・承認後に実施:

```sql
-- Amazon アソシエイト ID 設定例（実際の ID を使うこと）
update public.affiliate_settings
set
  affiliate_id = 'YOUR-ASSOCIATE-TAG',
  enabled = true,
  updated_at = now()
where shop_code = 'amazon';
```

⚠️ **`affiliate_id` は Git コミットしない。Supabase DB のみで管理する。**

---

## ロールバック手順

問題が発生した場合:

### Vercel でロールバック

- Vercel ダッシュボード > **Deployments** > 正常な過去のデプロイを選択 > **Promote to Production**

### DB のロールバック

- Supabase の Point-in-time Recovery（無料プランでは使えない場合がある）
- または手動で影響を受けた行を `DELETE` / `UPDATE` する

---

## 本番公開前チェックリスト（簡易版）

→ 詳細は `docs/SAFETY_PUBLICATION_CHECKLIST.md` を参照

- [ ] `npm run build` がエラー 0 で完了する
- [ ] Vercel 環境変数に `service_role` キーが入っていない
- [ ] Supabase RLS が有効になっている（全テーブル）
- [ ] `/api/click` の `ALLOWED_DESTINATION_HOSTS` に正規ショップドメインのみ登録されている
- [ ] `/report`・`/terms`・`/privacy`・`/safety-policy` が正常に表示される
- [ ] Google OAuth のリダイレクト URI が本番 URL に設定されている
- [ ] アフィリエイト ID が `affiliate_settings` テーブルにのみ存在し、Git に含まれていない

---

## 環境一覧

| 環境 | URL | Supabase プロジェクト |
|---|---|---|
| ローカル開発 | `http://localhost:3000` | `.env.local` の設定値 |
| Vercel プレビュー | `https://cheap-cross-search-git-branch.vercel.app` | 本番と同じ（または別途設定）|
| 本番 | **https://cheap-cross-search.vercel.app** | 本番 Supabase（lkusgqucqdvyijxjpqgh）|

---

## Phase 9 本番確認結果（2026-05-24 完了）

live-check-runner で自動確認。`npm run test:cheap-cross-search:phase9`

| テスト | 結果 |
|---|---|
| P9-1: / トップページ | ✅ PASS |
| P9-2: /search?q=スマホケース | ✅ PASS |
| P9-3: /report live モード | ✅ PASS |
| P9-4: /report submit enabled | ✅ PASS |
| P9-5: /login 本番フォーム | ✅ PASS |
| P9-6: /account → /login | ✅ PASS |
| P9-7: /favorites/products → /login | ✅ PASS |
| P9-8: /api/click Amazon | ✅ PASS |
| P9-9: /api/click 不正 URL ブロック | ✅ PASS |
| P9-10: ポリシーページ4点 | ✅ PASS |
| P9-11: /admin 管理画面 | ✅ PASS |
| P9-12: MANUAL ログイン確認 | ✅ ユーザー実機確認済み |
| P9-13: MANUAL /report DB 保存 | ✅ ユーザー実機確認済み |

**Phase 9 全確認完了（2026-05-24）。本番稼働中。**

ユーザー実機確認内容:
- 4ショップ横断比較表示 ✅
- 本番ログイン ✅
- /report 「偽物疑い」送信 → 「報告を受け付けました」 ✅

任意残タスク:
- Supabase Auth Redirect URL に `https://cheap-cross-search.vercel.app/auth/callback` を追加（メール認証フロー用）
- Vercel Preview 環境変数の設定
