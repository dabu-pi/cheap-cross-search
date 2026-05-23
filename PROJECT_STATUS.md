# PROJECT_STATUS — 安買い横断サーチ

最終更新: 2026-05-24（Phase 3 Supabase Auth + お気に入り 完了）

## 現状

| 項目 | 状態 |
|---|---|
| Phase 0（土台） | ✅ 完了 |
| Phase 1（link_only横断検索UI） | ✅ 完了 |
| Phase 2（商品カード比較UI） | ✅ 完了（デモデータ・2026-05-24）|
| Phase 3（Auth・お気に入り） | ✅ 完了（実DB適用待ち・2026-05-24）|
| Phase 4（管理画面） | 🔜 未着手 |
| Phase 5（取得アダプタ） | 🔜 未着手 |
| Phase 6（収益化） | 🔜 未着手 |
| Phase 7（一般公開準備） | 🔜 未着手 |

## 完了内容（Phase 0-1）

### Phase 0

- [x] Next.js 16 プロジェクト作成（TypeScript / Tailwind / App Router）
- [x] Supabase 接続雛形（client.ts / server.ts）
- [x] PWA manifest.json 作成
- [x] .env.local.example 作成
- [x] README.md 作成
- [x] PROJECT_STATUS.md 作成
- [x] ROADMAP.md 作成
- [x] Git 初期化（workspace 内サブディレクトリとして管理）
- [x] **独立 Git repo 化**（2026-05-24）— `dabu-pi/cheap-cross-search` として独立管理
- [x] **ブランチ整理**（2026-05-24）— main（安定版）/ feature/phase2-product-card-ui（Phase2作業用）
- [x] **開発ワークフロー記録**（2026-05-24）— `docs/DEVELOPMENT_WORKFLOW.md`

### Phase 1

- [x] ショップ定義（`lib/shops/shops.ts`）
  - Amazon / SHEIN / AliExpress / Temu の検索URLテンプレート
  - integrationMode（差し替え可能な取得方式）
- [x] 型定義（`lib/search/adapters/types.ts`）
  - IntegrationMode / PriceConfidence / ProductOffer / ShopSearchResult / CrossSearchResult
- [x] link_only アダプタ（`lib/search/adapters/link-only.ts`）
- [x] 横断検索エンジン（`lib/search/engine.ts`）
  - Promise.allSettled で並列検索
  - アダプタ差し替え可能な構造
- [x] トップページ（`/`）
  - 検索バー
  - 人気検索タグ
  - 対象ショップ一覧
- [x] 検索結果ページ（`/search?q=...`）
  - 4ショップ横断カード表示
  - link_only fallback 表示
  - 免責バナー
  - ローディングスケルトン（Suspense）
- [x] 免責事項ページ（`/disclaimer`）
- [x] 免責バナーコンポーネント
- [x] 検索バーコンポーネント（router.push 連携）
- [x] ショップカードコンポーネント（Phase 5以降の商品カード拡張前提）

## 現在の制約

| 制約 | 内容 |
|---|---|
| 商品データなし | 全ショップが link_only（検索リンクのみ） |
| API接続なし | Phase 5まで未接続 |
| Auth未実装 | Phase 3まで未実装 |
| 管理画面なし | Phase 4まで未実装 |
| DB未接続 | Supabase 雛形のみ。テーブル未作成 |
| PWA アイコン | placeholder（`/icons/icon-192.png` 等が未作成） |

## Phase 2 完了内容（2026-05-24）

### 新規作成ファイル

| ファイル | 内容 |
|---|---|
| `src/components/search/ProductCard.tsx` | 商品比較カード（欠損値安全・affiURL優先・お気に入り/問題報告プレースホルダー）|
| `src/components/search/ProductCardGrid.tsx` | 並び替えUI付きグリッド（Client Component・即時切替）|
| `src/lib/search/sort.ts` | 並び順ロジック（5種・スコア計算・欠損値安全）|
| `src/lib/search/demo-results.ts` | デモ商品データ（4ショップ×2〜3件・欠損パターン含む）|
| `src/lib/format/price.ts` | 価格表示ユーティリティ（JPY対応・null安全）|

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/app/search/page.tsx` | ProductCardGrid + デモバナー + link_only共存に拡張 |
| `src/lib/search/adapters/types.ts` | `source?: string` / `isSponsored?: boolean` を追加 |

### 設計方針（Phase 2時点）

- 実 API 接続はまだ未実装（Phase 5で実装予定）
- デモデータで比較 UI の完成形を確認できる状態
- link_only fallback ShopCard と共存（削除しない）
- アダプタ差し替え方針を維持（engine.ts は変更なし）
- 価格は参考価格として扱い、カード内に注意文を表示

## Phase 3 完了内容（2026-05-24）

### 新規作成ファイル

| ファイル | 内容 |
|---|---|
| `supabase/migrations/0001_auth_favorites.sql` | DB スキーマ + RLS（SQL 適用は手動）|
| `middleware.ts` | セッションリフレッシュ + 保護ルートリダイレクト |
| `src/lib/supabase/config.ts` | `isSupabaseConfigured()` helper |
| `src/lib/supabase/middleware.ts` | updateSession ロジック |
| `src/lib/auth/session.ts` | `getCurrentUser()` server helper |
| `src/lib/favorites/actions.ts` | Server Actions（お気に入り・検索履歴） |
| `src/app/login/page.tsx` | メール + Google ログインページ |
| `src/app/auth/callback/route.ts` | OAuth コールバック Route Handler |
| `src/app/account/page.tsx` | マイページ |
| `src/app/account/LogoutButton.tsx` | ログアウトボタン（Client Component）|
| `src/app/favorites/products/page.tsx` | お気に入り商品一覧 |
| `src/app/favorites/queries/page.tsx` | お気に入り検索ワード一覧 |
| `src/app/favorites/queries/RemoveFavoriteQueryButton.tsx` | 削除ボタン |
| `src/app/history/page.tsx` | 検索履歴 |
| `src/components/search/FavoriteProductButton.tsx` | お気に入りトグル（楽観的UI）|
| `src/components/search/FavoriteQueryButton.tsx` | 検索ワード保存ボタン |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/lib/supabase/client.ts` | null-safe（未設定時は null 返す） |
| `src/lib/supabase/server.ts` | null-safe（未設定時は null 返す） |
| `src/components/search/ProductCard.tsx` | FavoriteProductButton に差し替え |
| `src/app/search/page.tsx` | 検索履歴保存 + FavoriteQueryButton 追加 |
| `src/app/page.tsx` | ヘッダーに「マイページ」リンク追加 |

### 設計方針（Phase 3時点）

- **SQL 適用**: `supabase/migrations/0001_auth_favorites.sql` を Supabase ダッシュボードで手動実行
- **Supabase 未設定**: Auth 機能は非表示・graceful degradation。ビルドは通る
- **RLS**: 全テーブルで自分のデータのみ操作可能
- **検索履歴重複排除**: Phase 3 では毎回 insert（Phase 4 以降で upsert 対応予定）
- **お気に入り商品**: ProductOffer スナップショット保存（正規化 products テーブルは Phase 5 以降）

### 本番稼働に必要な手動ステップ

1. Supabase プロジェクト作成
2. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
3. `supabase/migrations/0001_auth_favorites.sql` を Supabase SQL Editor で実行
4. Authentication > Providers > Google を有効化（Google OAuth を使う場合）
5. Authentication > URL Configuration > Redirect URL に `/auth/callback` を追加

## 次のアクション（Phase 4 候補）

1. **管理画面**（`/admin/shops`・`/admin/affiliate`・`/admin/blocked-keywords`）
2. **検索履歴重複排除** — 同一 user_id + normalized_query の upsert 化

2. **Supabase テーブル設計・実テーブル作成**
   - shops / shop_integrations / search_queries / search_results_cache
   - product_offers / favorite_products / favorite_queries

3. **検索ログ保存**
   - ログインなし検索も session_id で記録

## 技術スタック

| 技術 | バージョン | 用途 |
|---|---|---|
| Next.js | 16.2.6 | フレームワーク |
| React | 最新 | UI |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 4.x | スタイル |
| @supabase/supabase-js | 最新 | DB/Auth |
| @supabase/ssr | 最新 | SSR対応 |
| next-pwa | 最新 | PWA |

## ショップ設定（現在）

| ショップ | mode | 状態 |
|---|---|---|
| Amazon | link_only | ✅ 動作 |
| SHEIN | link_only | ✅ 動作 |
| AliExpress | link_only | ✅ 動作 |
| Temu | link_only | ✅ 動作 |
