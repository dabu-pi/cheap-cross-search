# PROJECT_STATUS — 安買い横断サーチ

最終更新: 2026-05-24（Phase 5 取得アダプタ土台 実装完了）

## 現状

| 項目 | 状態 |
|---|---|
| Phase 0（土台） | ✅ 完了 |
| Phase 1（link_only横断検索UI） | ✅ 完了 |
| Phase 2（商品カード比較UI） | ✅ 完了（デモデータ・2026-05-24）|
| Phase 3（Auth・お気に入り） | ✅ 完了（実DB適用待ち・2026-05-24）|
| Phase 3.5（Auth動作確認） | ✅ 完了（graceful degradation 検証・2026-05-24）|
| Phase 4（管理画面） | ✅ 完了（土台・デモデータ・12/12 PASS・2026-05-24）|
| Phase 5（取得アダプタ土台） | ✅ 完了（registry・mock・10/10 PASS・2026-05-24）|
| Phase 6（収益化） | 🔜 未着手 |
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

## Phase 3.5 完了内容（2026-05-24）

### Auth 動作確認・graceful degradation 検証

| 確認項目 | 結果 |
|---|---|
| Supabase 設定状態 | 未設定（`.env.local` なし）|
| Google OAuth 設定 | 未設定（Supabase プロジェクト未作成）|
| SQL 適用状態 | 未適用（`supabase/migrations/0001_auth_favorites.sql` のみ作成済み）|
| `npm run build` | ✅ 成功（graceful degradation 動作確認）|
| live-check-runner spec | ✅ 9/11 PASS・2 SKIP（P3V-10/11: Supabase 設定後に確認）|

### live-check-runner spec 結果（2026-05-24）

| テスト | 結果 | 内容 |
|---|---|---|
| P3V-1: トップページ | ✅ PASS | タイトル「安買い」・検索バー表示確認 |
| P3V-2: 商品カード表示 | ✅ PASS | /search?q=スマホケース で複数カード表示 |
| P3V-3: デモバナー | ✅ PASS | 「サンプル表示中」バナー確認 |
| P3V-4: 並び替えUI | ✅ PASS | 「おすすめ順」「安い順」ボタン確認 |
| P3V-5: /login | ✅ PASS | 「認証機能は未設定です」表示確認 |
| P3V-6: /account | ✅ PASS | 「認証機能は未設定です」表示確認 |
| P3V-7: /favorites/products | ✅ PASS | 「認証機能は未設定です」表示確認 |
| P3V-8: /favorites/queries | ✅ PASS | 「認証機能は未設定です」表示確認 |
| P3V-9: /history | ✅ PASS | 「認証機能は未設定です」表示確認 |
| P3V-10: ログイン後お気に入り保存 | ⏭ SKIP | Supabase テストアカウント未設定 |
| P3V-11: ログイン後検索履歴保存 | ⏭ SKIP | Supabase テストアカウント未設定 |

### 新規作成ファイル（Phase 3.5）

| ファイル | 内容 |
|---|---|
| `docs/SUPABASE_SETUP.md` | Supabase 本番設定手順（段階別）|

---

## Phase 4 完了内容（2026-05-24）

### 管理画面 土台実装

| ページ | 内容 |
|---|---|
| `/admin` | 管理ダッシュボード（KPIサマリ・メニュー・取得状態一覧） |
| `/admin/shops` | ショップ管理（4ショップ・enabled/mode/URLテンプレート表示）|
| `/admin/affiliate` | アフィリエイト設定（ID/リンクテンプレート/画像許可等）|
| `/admin/blocked-keywords` | 除外キーワード管理（15件デモデータ・カテゴリ別）|
| `/admin/fetch-logs` | 取得ログ・状態表示（ショップ別API取得状態）|

### 新規作成ファイル（Phase 4）

| ファイル | 内容 |
|---|---|
| `src/lib/admin/types.ts` | 管理画面用型定義（ShopAdminConfig / AffiliateConfig / BlockedKeyword / FetchLogEntry）|
| `src/lib/admin/demo-settings.ts` | ショップ・アフィリエイト設定デモデータ |
| `src/lib/admin/blocked-keywords.ts` | 除外キーワードデモデータ（15件・6カテゴリ）|
| `src/lib/admin/fetch-logs.ts` | 取得ログデモデータ・ステータスユーティリティ |
| `src/app/admin/layout.tsx` | 管理画面共通レイアウト（AdminNav 内包）|
| `src/app/admin/page.tsx` | 管理ダッシュボード |
| `src/app/admin/shops/page.tsx` | ショップ管理 |
| `src/app/admin/affiliate/page.tsx` | アフィリエイト設定 |
| `src/app/admin/blocked-keywords/page.tsx` | 除外キーワード管理 |
| `src/app/admin/fetch-logs/page.tsx` | 取得ログ表示 |
| `src/components/admin/AdminNav.tsx` | 管理ナビゲーション（横スクロール対応・スマホ最適化）|
| `src/components/admin/AdminSectionCard.tsx` | AdminSectionCard / AdminDevPreviewBanner / AdminSaveUnavailableBanner |

### live-check-runner spec 結果（Phase 4・2026-05-24）

| テスト | 結果 | 内容 |
|---|---|---|
| P4V-1: /admin 表示 | ✅ PASS | ダッシュボード表示確認 |
| P4V-2: ショップサマリ | ✅ PASS | 有効ショップ数表示確認 |
| P4V-3: /admin/shops 表示 | ✅ PASS | ショップ管理ページ表示確認 |
| P4V-4: 4ショップ表示 | ✅ PASS | Amazon/SHEIN/AliExpress/Temu 全表示確認 |
| P4V-5: 取得方式表示 | ✅ PASS | link_only バッジ表示確認 |
| P4V-6: /admin/affiliate 表示 | ✅ PASS | アフィリエイト設定ページ表示確認 |
| P4V-7: /admin/blocked-keywords 表示 | ✅ PASS | 除外キーワードページ表示確認 |
| P4V-8: キーワード行表示 | ✅ PASS | 処方箋・医薬品系カテゴリ表示確認 |
| P4V-9: /admin/fetch-logs 表示 | ✅ PASS | 取得ログページ表示確認 |
| P4V-10: 開発プレビューバナー | ✅ PASS | Supabase未設定時バナー表示確認 |
| P4V-11: 通常画面へ戻るリンク | ✅ PASS | 「通常画面へ」リンク確認 |
| P4V-12: スマホ幅表示 | ✅ PASS | 375px でレイアウト崩れなし |

### 設計方針（Phase 4時点）

- **管理者権限**: 現時点は Supabase 未設定のため全ユーザーが管理画面にアクセス可能。Supabase 設定後に `admin_users` テーブルで制御する
- **データ**: デモデータ / 静的設定ベース。Supabase 設定後に DB テーブルへ移行
- **graceful degradation**: Supabase 未設定でも全管理ページが「開発プレビュー表示」バナー付きで動作
- **保存機能**: 「保存機能は Supabase 設定後に有効化予定」バナーを表示
- **将来の DB テーブル**: admin_shop_configs / admin_affiliate_configs / blocked_keywords / fetch_logs

### 本番で必要な追加実装

1. `admin_users` テーブル作成 + Middleware で管理者チェック
2. ショップ設定を DB 保存・UI から編集・保存できるようにする
3. アフィリエイト ID を DB に保存し商品リンクに自動適用（Phase 6）
4. 除外キーワードを DB に保存・検索フィルターに適用
5. 取得ログを実 API アダプタ接続時に DB 記録（Phase 5）

---

## Phase 5 完了内容（2026-05-24）

### 取得アダプタ土台 実装

| 項目 | 内容 |
|---|---|
| アダプタ共通インターフェース | `SearchAdapter` / `SearchAdapterInput` 型を拡張 |
| アダプタ registry | `registry.ts` — モードに応じて安全にアダプタを選択・fallback |
| ExternalMockAdapter | `external_api` モードのモックアダプタ（参照実装）|
| DisabledAdapter | `disabled` モード専用アダプタ |
| 検索エンジン更新 | `engine.ts` — registry 経由でアダプタを選択・全ショップ並列実行 |
| CrossSearchResult 拡張 | `offers[]` / `globalWarnings` フィールド追加 |
| ShopSearchResult 拡張 | `warnings[]` / `requestedMode` フィールド追加 |
| SearchStatusSummary | 検索ページの取得状態サマリ UI |

### 新規作成ファイル（Phase 5）

| ファイル | 内容 |
|---|---|
| `src/lib/search/adapters/registry.ts` | アダプタ registry + フォールバック + ラベル/カラー |
| `src/lib/search/adapters/external-mock.ts` | external_api モックアダプタ（参照実装） |
| `src/lib/search/adapters/disabled.ts` | disabled アダプタ |
| `src/components/search/SearchStatusSummary.tsx` | ショップ別取得状態バッジ |
| `docs/ADAPTER_ARCHITECTURE.md` | アダプタ設計・フォールバック方針・将来接続手順 |

### 変更ファイル（Phase 5）

| ファイル | 変更内容 |
|---|---|
| `src/lib/search/adapters/types.ts` | `SearchAdapterInput` / `warnings` / `requestedMode` / `offers` / `globalWarnings` 追加 |
| `src/lib/search/adapters/link-only.ts` | `SearchAdapterInput` シグネチャに対応 / `mode` フィールド追加 |
| `src/lib/search/engine.ts` | registry 経由でアダプタ選択・全ショップ処理・オファー集約 |
| `src/app/search/page.tsx` | `SearchStatusSummary` 追加・registry 経由オファー優先表示 |

### フォールバック方針（Phase 5）

| モード | アダプタ | オファー返却 |
|---|---|---|
| `official_api` | LinkOnlyAdapter（警告付き fallback）| ❌ |
| `affiliate_api` | LinkOnlyAdapter（警告付き fallback）| ❌ |
| `external_api` | ExternalMockAdapter | ✅（モック）|
| `link_only` | LinkOnlyAdapter | ❌ |
| `disabled` | DisabledAdapter | ❌ |

### live-check-runner spec 結果（Phase 5・2026-05-24）

| テスト | 結果 | 内容 |
|---|---|---|
| P5V-1: トップページ | ✅ PASS | タイトル確認 |
| P5V-2: 商品カード表示 | ✅ PASS | /search?q=スマホケース 複数カード確認 |
| P5V-3: 取得状態サマリ | ✅ PASS | 4ショップ名バッジ表示確認 |
| P5V-4: link_only バッジ | ✅ PASS | 「リンクのみ」バッジ確認 |
| P5V-5: デモバナー | ✅ PASS | 「サンプル表示中」バナー確認 |
| P5V-6: ShopCard 直接検索 | ✅ PASS | 「で検索」リンク確認 |
| P5V-7: 特殊クエリ耐性 | ✅ PASS | 記号含むクエリでクラッシュなし |
| P5V-8: 管理画面 取得方式 | ✅ PASS | /admin/shops リンクのみ表示 |
| P5V-9: Supabase 未設定耐性 | ✅ PASS | 全ページ graceful degradation |
| P5V-10: スマホ幅 | ✅ PASS | 375px 崩れなし |

---

## 次のアクション（Phase 6 候補）

1. **Supabase 本番接続** — `docs/SUPABASE_SETUP.md` の手順を実施
2. **検索履歴重複排除** — 同一 user_id + normalized_query の upsert 化

3. **Supabase テーブル設計・実テーブル作成**
   - shops / shop_integrations / search_queries / search_results_cache
   - product_offers / favorite_products / favorite_queries

4. **検索ログ保存**
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
