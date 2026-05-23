# SUPABASE_SETUP.md — 安買い横断サーチ Supabase 設定手順

最終更新: 2026-05-24（Phase 8 更新）

---

## 現状（2026-05-24 時点）

| 項目 | 状態 |
|---|---|
| Supabase プロジェクト | 未作成 |
| `.env.local` | 未作成 |
| SQL 適用 | 未実施 |
| Google OAuth | 未設定 |
| Auth 機能 | graceful degradation（未設定案内を表示）|
| click_events 保存 | Supabase 設定後に自動有効化 |
| reported_products 保存 | Supabase 設定後に自動有効化 |
| admin_users | 手動 INSERT が必要 |

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

⚠️ 0001 の実行後に実行すること（admin_users が click_events の RLS で参照されるため）。

作成されるテーブル:

| テーブル | 用途 |
|---|---|
| `click_events` | アフィリエイトクリックログ |
| `reported_products` | 商品問題報告 |
| `admin_users` | 管理者ユーザーリスト（手動管理）|
| `affiliate_settings` | アフィリエイト設定（初期データ込み・affiliate_id は空）|
| `blocked_keywords` | DB 管理の動的キーワードルール（初期データなし）|

実行後の確認 SQL:

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

期待される結果（計 9 テーブル）:
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
