# SUPABASE_SETUP.md — 安買い横断サーチ Supabase 設定手順

最終更新: 2026-05-24

---

## 現状（2026-05-24 時点）

| 項目 | 状態 |
|---|---|
| Supabase プロジェクト | 未作成 |
| `.env.local` | 未作成 |
| SQL 適用 | 未実施 |
| Google OAuth | 未設定 |
| Auth 機能 | graceful degradation（未設定案内を表示）|

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

## Step 3: SQL スキーマ適用

1. Supabase ダッシュボード > **SQL Editor** を開く
2. 以下のファイルの内容をコピー＆ペースト:
   ```
   C:\hirayama-ai-workspace\workspace\cheap-cross-search\supabase\migrations\0001_auth_favorites.sql
   ```
3. **Run** をクリック

作成されるテーブル:

| テーブル | 用途 |
|---|---|
| `profiles` | ユーザープロフィール（signup トリガーで自動作成）|
| `search_queries` | 検索履歴 |
| `favorite_products` | お気に入り商品（ProductOffer スナップショット）|
| `favorite_queries` | お気に入り検索ワード |

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
     ```
     （本番 Vercel URL も追加: `https://<your-app>.vercel.app/auth/callback`）

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

---

## Step 6: live-check-runner で P3V-10/11 確認

```powershell
# ローカルで dev サーバーを起動しておく
cd C:\hirayama-ai-workspace\workspace\tools\live-check-runner
npm run test:cheap-cross-search:phase3
```

P3V-10/11 の SKIP を解除するには `phase3-auth-verify.spec.ts` のテスト内ロジックを実装（テストアカウントの認証情報が必要）。

---

## 本番デプロイ時の追加手順（Vercel）

1. Vercel プロジェクト設定 > **Environment Variables** に以下を追加:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. Supabase > Authentication > URL Configuration > Redirect URLs に本番 URL を追加:
   ```
   https://<your-app>.vercel.app/auth/callback
   ```

3. Google OAuth の「承認済みのリダイレクト URI」に本番 Supabase callback URL を追加（Step 4 の手順と同様）

---

## トラブルシューティング

### 「認証機能は未設定です」が表示される

→ `.env.local` が存在しないか、変数名が間違っている。
`.env.local` を確認し、dev サーバーを再起動すること。

### `/auth/callback` でエラーになる

→ Supabase の Redirect URLs に `http://localhost:3000/auth/callback` が登録されていない。
Authentication > URL Configuration で確認すること。

### ログイン後にセッションが維持されない

→ Supabase の `@supabase/ssr` バージョンが古い可能性。
`npm list @supabase/ssr` でバージョン確認。
