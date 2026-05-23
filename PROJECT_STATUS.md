# PROJECT_STATUS — 安買い横断サーチ

最終更新: 2026-05-24（repo独立化・ブランチ整理完了）

## 現状

| 項目 | 状態 |
|---|---|
| Phase 0（土台） | ✅ 完了 |
| Phase 1（link_only横断検索UI） | ✅ 完了 |
| Phase 2（商品カード比較UI） | 🔜 未着手 |
| Phase 3（Auth・お気に入り） | 🔜 未着手 |
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

## 次のアクション（Phase 2候補）

1. **商品カード比較UIの実装**
   - ダミーデータまたは外部APIの仮データで比較UIを構築
   - 商品画像・価格・送料・評価の表示
   - おすすめ順 / 安い順の並び替え
   - Phase 5 API実装時に差し替えやすい構造

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
