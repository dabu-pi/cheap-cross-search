# SUPABASE_SETUP.md — 安買い横断サーチ Supabase 設定手順

最終更新: 2026-05-24（Phase 8b /report INSERT 失敗修正・0003 hotfix）

---

## ⚠️ /report 送信失敗修正（2026-05-24）— `0003_fix_reported_products_insert_policy.sql`

**症状:** `/report` フォームで「送信に失敗しました。時間をおいて再度お試しください。」が表示される

**原因:** `0002` migration で RLS policy（`with check (true)`）は設定済みだが、
Supabase SQL Editor 経由で作成したテーブルには `ALTER DEFAULT PRIVILEGES` が自動適用されない場合がある。
`anon` ロールが `INSERT` 権限を持たないため Supabase が 403/RLS エラーを返す。

**修正:** `supabase/migrations/0003_fix_reported_products_insert_policy.sql` を SQL Editor で実行  
→ `anon` / `authenticated` に対して明示的 GRANT を付与（Step 3-3 参照）

---

## ⚠️ migration 0002 修正履歴（2026-05-24）

**初回実行時のエラー:** `42P01: relation "public.admin_users" does not exist`

**原因:** `0002_tracking_reports_admin.sql` の初版で `click_events` の RLS policy が
`public.admin_users` を参照していたが、`admin_users` の CREATE TABLE がその後（section C）にあった。
PostgreSQL はトランザクション全体をロールバックしたため、5テーブル全て未作成となった。

**修正内容:** テーブル作成順を以下に変更し、全 policy を `drop policy if exists` + `create policy` に変更（再実行安全化）:

```
(旧) click_events → reported_products → admin_users → affiliate_settings → blocked_keywords
(新) admin_users → set_updated_at() → click_events → reported_products → affiliate_settings → blocked_keywords
```

修正済みファイル: `supabase/migrations/0002_tracking_reports_admin.sql`（再実行してください）

---

## 現状（2026-05-24 時点）

| 項目 | 状態 |
|---|---|
| Supabase プロジェクト | 作成済み |
| `.env.local` | ✅ 設定済み（NEXT_PUBLIC_SUPABASE_URL / ANON_KEY）|
| `0001_auth_favorites.sql` | ✅ 適用済み（profiles / search_queries / favorite_products / favorite_queries）|
| `0002_tracking_reports_admin.sql` | ✅ 適用済み（admin_users / click_events / reported_products / affiliate_settings / blocked_keywords）|
| `0003_fix_reported_products_insert_policy.sql` | ⏳ **要実行**（/report INSERT 失敗修正・anon GRANT 追加）|
| Google OAuth | 未設定 |
| Auth 機能 | ✅ ログインフォーム表示確認済み |
| click_events 保存 | ✅ 実装済み（0003 適用後に動作確認）|
| reported_products 保存 | ⚠️ INSERT 失敗中（0003 適用で修正）|
| admin_users | ⏳ 手動 INSERT が必要（P8B-10）|

---

## Step 1: Supabase プロジェクト作成

1. [https://app.supabase.com/](https://app.supabase.com/) にアクセス
2. 「New project」をクリック
3. 以下を設定:
   - **Name**: `cheap-cross-search`（任意）
   - **Region**: `Northeast Asia (Tokyo)` 推奨
   - **Database Password**: 強いパスワードを設定（メモしておく）

---

## Step 2: 環境変数設定（`.env.local`）

プロジェクトダッシュボードの **Settings > API** から以下を取得:

```env
# C:\hirayama-ai-workspace\workspace\cheap-cross-search\.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ `.env.local` は `.gitignore` に含まれています。**Git に絶対コミットしないこと。**

---

## Step 3: SQL スキーマ適用（2ファイル、この順で実行）

Supabase ダッシュボード > **SQL Editor** を開き、以下のファイルを順に実行する。

### 3-1: Phase 3 Auth + お気に入りテーブル

ファイル: `supabase/migrations/0001_auth_favorites.sql`

作成されるテーブル:

| テーブル | 用途 |
|---|---|
| `profiles` | ユーザープロフィール（signup トリガーで自動作成）|
| `search_queries` | 検索履歴 |
| `favorite_products` | お気に入り商品（ProductOffer スナップショット）|
| `favorite_queries` | お気に入り検索ワード |

### 3-2: Phase 8 計測・報告・管理テーブル

ファイル: `supabase/migrations/0002_tracking_reports_admin.sql`

⚠️ 0001 の実行後に実行すること。  
⚠️ 初版でエラーが出た場合は修正済みのファイルを再実行してください（再実行安全化済み）。

作成されるテーブル（内部実行順: admin_users → click_events → reported_products → affiliate_settings → blocked_keywords）:

| テーブル | 用途 |
|---|---|
| `admin_users` | 管理者ユーザーリスト（手動管理）|
| `click_events` | アフィリエイトクリックログ |
| `reported_products` | 商品問題報告 |
| `affiliate_settings` | アフィリエイト設定（初期データ込み・affiliate_id は空）|
| `blocked_keywords` | DB 管理の動的キーワードルール（初期データなし）|

**実行後の確認 SQL（SQL Editor に貼り付けて実行）:**

```sql
-- [確認1] 5テーブルの存在確認（全て NOT NULL なら成功）
select
  to_regclass('public.admin_users')        as admin_users,
  to_regclass('public.click_events')       as click_events,
  to_regclass('public.reported_products')  as reported_products,
  to_regclass('public.affiliate_settings') as affiliate_settings,
  to_regclass('public.blocked_keywords')   as blocked_keywords;
```

期待: 全列に `admin_users`、`click_events`、... と表示される（`null` が出たら失敗）

```sql
-- [確認2] RLS 有効確認（rowsecurity = true が 5行）
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'admin_users', 'click_events', 'reported_products',
    'affiliate_settings', 'blocked_keywords'
  )
order by tablename;
```

期待: 5行すべて `rowsecurity = true`

```sql
-- [確認3] 全テーブル一覧（0001 + 0002 合計 9テーブル）
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

期待される結果:
```
admin_users
affiliate_settings
blocked_keywords
click_events
favorite_products
favorite_queries
profiles
reported_products
search_queries
```

### 3-3: /report INSERT 修正・anon GRANT 追加（0003 hotfix）

ファイル: `supabase/migrations/0003_fix_reported_products_insert_policy.sql`

⚠️ 0001 + 0002 の実行後に実行すること。  
⚠️ 既存テーブルの DROP / データ削除はなし（べき等・再実行安全）。

**この SQL が行うこと:**

| ステップ | 内容 |
|---|---|
| STEP 1 | `grant usage on schema public to anon, authenticated`（念のため再付与）|
| STEP 2 | `grant insert on public.reported_products to anon`（anon が INSERT できるように）|
| STEP 3 | `grant insert on public.click_events to anon`（クリック計測も同様）|
| STEP 4 | `affiliate_settings` / `blocked_keywords` への SELECT GRANT |
| STEP 5 | `admin_users` への authenticated SELECT GRANT |
| STEP 6 | `reported_products` RLS policy 再作成（idempotent）|
| STEP 7 | `click_events` RLS policy 再作成（idempotent）|

**実行後の確認 SQL（SQL Editor で別途実行）:**

```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('reported_products', 'click_events')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;
```

期待される結果:
```
authenticated | click_events    | INSERT
authenticated | click_events    | SELECT
authenticated | reported_products | INSERT
authenticated | reported_products | SELECT
anon          | click_events    | INSERT
anon          | reported_products | INSERT
```

**適用後の動作確認:**

1. `/report` フォームを開く
2. 「偽物疑い・コピー品の可能性」を選択
3. 「報告する」をクリック
4. 「報告を受け付けました」が表示されることを確認
5. Supabase Dashboard > Table Editor > `reported_products` に行が追加されることを確認
6. ブラウザ DevTools console に `[report] insert failed:` が出ないことを確認

---

## Step 4: Google OAuth 設定（任意）

Google ログインを有効にする場合:

1. [Google Cloud Console](https://console.cloud.google.com/) で OAuth クライアント作成
   - **認証情報** > **OAuth 2.0 クライアント ID** を作成
   - **承認済みのリダイレクト URI** に追加:
     ```
     https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
     ```

2. Supabase ダッシュボード > **Authentication > Providers > Google**:
   - **Enable Google provider** を ON
   - Client ID / Client Secret を貼り付け

3. Supabase ダッシュボード > **Authentication > URL Configuration**:
   - **Redirect URLs** に追加:
     ```
     http://localhost:3000/auth/callback
     https://<your-app>.vercel.app/auth/callback
     ```

---

## Step 5: ローカル動作確認

```powershell
cd C:\hirayama-ai-workspace\workspace\cheap-cross-search
npm run dev
```

ブラウザで以下を確認:
- [http://localhost:3000/login](http://localhost:3000/login) → ログインフォームが表示される（「認証機能は未設定です」ではなく）
- メールアドレス + パスワードでアカウント作成
- ログイン後 `/account` でメールアドレスが表示される
- `/report?offerId=test` で報告フォーム → 送信 → `reported_products` に行が追加される
- 商品カードをクリック → `/api/click` → `click_events` に行が追加される

---

## Step 6: 管理者ユーザー登録

```powershell
# 1. /login でアカウント作成後、Supabase ダッシュボードでユーザー UUID を確認
# 2. SQL Editor で以下を実行
```

```sql
insert into public.admin_users (user_id, role, notes)
values ('<ここにユーザーUUID>', 'admin', '平山克司（サービス管理者）');
```

確認:
```sql
select * from public.admin_users;
```

---

## Step 7: live-check-runner で全フェーズ確認

```powershell
cd C:\hirayama-ai-workspace\workspace\cheap-cross-search
npm run dev   # 別ターミナルで起動しておく

cd C:\hirayama-ai-workspace\workspace\tools\live-check-runner

# Phase 3 Auth（P3V-1〜9 は自動、P3V-10/11 は Supabase 設定後に手動確認）
npm run test:cheap-cross-search:phase3

# Phase 4 管理画面
npm run test:cheap-cross-search:phase4

# Phase 5 アダプタ
npm run test:cheap-cross-search:phase5

# Phase 6 アフィリエイト
npm run test:cheap-cross-search:phase6

# Phase 7 安全フィルター
npm run test:cheap-cross-search:phase7

# Phase 8 Supabase/Vercel 準備
npm run test:cheap-cross-search:phase8
```

---

## Step 8: アフィリエイト ID 設定（申請後）

各ショップのアフィリエイトプログラムに参加・承認された後:

```sql
-- 例: Amazon アソシエイト
update public.affiliate_settings
set affiliate_id = 'YOUR-TAG', enabled = true, updated_at = now()
where shop_code = 'amazon';
```

⚠️ `affiliate_id` は絶対に Git に入れない。Supabase DB のみで管理する。

---

## Step 9: P3V-10/11 再確認（Auth 動作確認）

`phase3-auth-verify.spec.ts` の P3V-10/11 は Supabase 設定後に手動確認が必要:

- P3V-10: メールログイン → `/account` に表示
- P3V-11: お気に入り保存 → `/favorites/products` に表示

テスト用アカウントを作成し、スペックファイル内の TODO コメントに従って設定する。

---

## トラブルシューティング

### 「認証機能は未設定です」が表示される

→ `.env.local` が存在しないか、変数名が間違っている。
`.env.local` を確認し、dev サーバーを再起動すること。

### `/auth/callback` でエラーになる

→ Supabase の Redirect URLs に `http://localhost:3000/auth/callback` が登録されていない。
Authentication > URL Configuration で確認すること。

### click_events に INSERT されない

→ `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しく設定されているか確認。
→ RLS: `click_events: anyone insert` ポリシーが有効になっているか確認（0002 SQL を適用済みか）。

### reported_products に INSERT されない

→ 同上。RLS: `reported_products: anyone insert` ポリシーを確認。
→ `demoMode` が `true` のままになっていないか（Supabase 未設定時は demoMode=true）。

### 管理画面でデータが見えない

→ `admin_users` テーブルに自分のユーザー UUID が登録されているか確認（Step 6）。
→ RLS: `click_events: admin read` / `reported_products: admin read` ポリシーが有効か確認。
