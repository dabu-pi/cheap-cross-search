# ROADMAP — 安買い横断サーチ

## フェーズ概要

| Phase | タイトル | 状態 | 優先 |
|---|---|---|---|
| 0 | プロジェクト土台 | ✅ 完了 | - |
| 1 | 検索UI + link_only横断検索 | ✅ 完了 | - |
| 2 | 商品カード比較UI | ✅ 完了（デモ） | - |
| 3 | Supabase Auth + お気に入り | ✅ 完了（実DB適用待ち）| - |
| 3.5 | Auth動作確認・graceful degradation | ✅ 完了（2026-05-24）| - |
| 4 | 管理画面 | ✅ 完了（土台・2026-05-24）| - |
| 5 | 取得アダプタ土台 | ✅ 完了（registry・mock・2026-05-24）| - |
| 6 | 収益化（アフィリエイト） | 🔜 未着手 | ★★☆ |
| 5 | 取得アダプタ実装（API接続） | 🔜 未着手 | ★★☆ |
| 6 | 収益化（アフィリエイト） | 🔜 未着手 | ★★☆ |
| 7 | 一般公開準備 | 🔜 未着手 | ★★☆ |

---

## Phase 0: プロジェクト土台 ✅

**完了条件:** ローカル起動・Vercelデプロイ・PWA最低構成・docs記録

- [x] Next.js プロジェクト作成
- [x] TypeScript / Tailwind / ESLint
- [x] Supabase 雛形
- [x] PWA manifest.json
- [x] .env.local.example
- [x] README / PROJECT_STATUS / ROADMAP

---

## Phase 1: 検索UI + link_only横断検索 ✅

**完了条件:** 1ワードで4ショップの検索リンクが出る・各ショップへ遷移できる

- [x] ショップ定義（shops.ts）
- [x] 型定義（types.ts）
- [x] link_only アダプタ
- [x] 横断検索エンジン（アダプタ差し替え可能）
- [x] トップページ（/）
- [x] 検索結果ページ（/search?q=...）
- [x] 免責事項ページ（/disclaimer）
- [x] 検索バー・ショップカード・免責バナー

---

## Phase 2: 商品カード比較UI ✅ 完了（2026-05-24）

**完了条件:** ダミーまたは仮データで比較UIが成立・商品あり/なし両方の表示が崩れない

- [x] 商品カードコンポーネント（`components/search/ProductCard.tsx`）
  - 商品画像プレースホルダー（外部URL不使用・ロゴカラー代替）
  - 商品名・本体価格・送料・合計見込み価格
  - 到着予定・評価・レビュー数（欠損値はそれぞれ「不明/なし」表示）
  - 価格信頼度バッジ（high/medium/low/unknown）
  - affiliateUrl 優先リンク
  - お気に入り・問題報告プレースホルダー（Phase 3+ 用）
- [x] 並び替えUI（`components/search/ProductCardGrid.tsx` — Client Component）
  - おすすめ順 / 安い順 / 到着が早い順 / 評価が高い順 / レビュー多い順
  - クライアントサイド即時切替（ページリロードなし）
- [x] おすすめスコア計算ロジック（`lib/search/sort.ts`）
  - 合計見込み価格・評価・レビュー数・ショップ信頼度・価格信頼度を加重合算
- [x] デモデータ（`lib/search/demo-results.ts`）
  - Amazon / SHEIN / AliExpress / Temu 各2〜3件
  - 価格あり・送料不明・到着不明・評価なし・price_confidence unknown など欠損パターン含む
- [x] 価格表示ユーティリティ（`lib/format/price.ts`）
  - null/undefined 安全、JPY/将来通貨対応
- [x] link_only fallback ShopCard と共存
- [x] デモ注意バナー表示
- [x] `npm run lint` 警告0・`npm run build` 成功確認済み

---

## Phase 3: Supabase Auth + お気に入り ✅ 完了（2026-05-24）

**完了条件:** 未ログインでも検索可能・ログイン時のみ保存系機能が使える

- [x] Supabase DB スキーマ設計（`supabase/migrations/0001_auth_favorites.sql`）
  - profiles / search_queries / favorite_products / favorite_queries
  - RLS 設定（自分のデータのみ操作可能）
  - click_events は Phase 6 向けコメントアウト案として記載
- [x] メールログイン（`/login`）
- [x] Googleログイン（OAuth → `/auth/callback`）
- [x] 未ログイン時ログイン誘導（全保護ページ）
- [x] お気に入り商品（`/favorites/products`・`FavoriteProductButton` 楽観的UI）
- [x] お気に入り検索ワード（`/favorites/queries`・`FavoriteQueryButton`）
- [x] 検索履歴自動保存（ログイン時、`/history` に表示）
- [x] ログアウト（`/account` > `LogoutButton`）
- [x] マイページ（`/account`）
- [x] Middleware（セッションリフレッシュ・保護ルートリダイレクト）
- [x] Supabase 未設定でもビルド可能・graceful degradation
- [x] `npm run lint` 警告0・`npm run build` 成功（10 routes）

**⚠️ 本番 Supabase への SQL 適用はまだ実施していない（手動ステップ）:**

```
Supabase ダッシュボード > SQL Editor で
supabase/migrations/0001_auth_favorites.sql を実行すること
```

**Supabase ダッシュボード設定も必要（Google OAuth）:**
```
Authentication > Providers > Google を有効化
Authentication > URL Configuration > Redirect URL に /auth/callback を追加
```

---

## Phase 3.5: Auth 動作確認・graceful degradation ✅ 完了（2026-05-24）

**完了条件:** Supabase 未設定状態でビルド・全ページが正常表示される

- [x] live-check-runner spec 作成（`tools/live-check-runner/projects/cheap-cross-search/phase3-auth-verify.spec.ts`）
- [x] P3V-1〜P3V-9: 自動テスト 9件 PASS（graceful degradation 確認）
- [x] P3V-10/11: SKIP（Supabase テストアカウント設定後に確認）
- [x] `docs/SUPABASE_SETUP.md` 作成（本番設定手順）
- [x] PROJECT_STATUS.md / ROADMAP.md 更新

**Supabase 接続状態（2026-05-24 時点）:**
- `.env.local`: 未作成
- Supabase プロジェクト: 未作成
- SQL 適用: 未実施
- Google OAuth: 未設定

---

## Phase 4: 管理画面 ✅ 完了（土台・2026-05-24）

**完了条件（Phase 4 土台）:** 管理画面の UI・型・デモデータ が動作し、Supabase 設定後に DB 移行できる構造

- [x] 管理画面ルート (`/admin`, `/admin/shops`, `/admin/affiliate`, `/admin/blocked-keywords`, `/admin/fetch-logs`)
- [x] 管理画面共通レイアウト (`AdminNav` / `AdminSectionCard` / `AdminDevPreviewBanner`)
- [x] ショップ管理 UI（4ショップ・enabled/mode/URLテンプレート表示）
- [x] アフィリエイト設定 UI（ID/リンクテンプレート/画像許可）
- [x] 除外キーワード管理 UI（15件デモデータ・6カテゴリ）
- [x] 取得ログ UI（ショップ別 API 取得状態）
- [x] 管理画面用型定義 (`src/lib/admin/types.ts`)
- [x] Supabase 未設定でもビルド可能・graceful degradation
- [x] live-check-runner P4V-1〜12 全 12件 PASS
- [ ] 管理者権限チェック（admin_users テーブル） → Supabase 設定後に実装
- [ ] ショップ設定の DB 保存・UI から編集 → Supabase 設定後に実装
- [ ] 除外キーワードの DB 保存・検索フィルター適用 → Supabase 設定後に実装
- [ ] 通報管理（/admin/reports） → Phase 7 以降

---

## Phase 5: 取得アダプタ土台 ✅ 完了（2026-05-24）

**完了条件（Phase 5 土台）:** アダプタ registry が動作し、取得方式を安全に差し替えられる構造

- [x] `SearchAdapter` インターフェース拡張（`SearchAdapterInput` / `warnings` / `requestedMode`）
- [x] アダプタ registry（`registry.ts`）— モード別選択・安全 fallback
- [x] `ExternalMockAdapter` — external_api モックアダプタ（参照実装）
- [x] `DisabledAdapter` — disabled モード専用
- [x] 検索エンジン更新（registry 経由・全ショップ並列・オファー集約）
- [x] `SearchStatusSummary` コンポーネント（検索ページの取得状態バッジ）
- [x] `docs/ADAPTER_ARCHITECTURE.md` — アダプタ設計書
- [x] live-check-runner P5V-1〜10 全 10件 PASS
- [ ] 本格 API アダプタ実装 → 各 API 申請後に実装
  - AliExpress Affiliate API / TKAPI（優先）
  - Amazon PA-API 5.0（審査必要）
  - SHEIN Developer Platform（審査制）
  - Temu Partner Platform（招待制）
- [ ] キャッシュ実装（search_results_cache テーブル）→ Supabase 設定後
- [ ] 取得ログ DB 保存 → Supabase 設定後

---

## Phase 6: 収益化（アフィリエイト）🔜

**完了条件:** 商品クリックが計測される・アフィリエイトリンクへ遷移できる

- [ ] アフィリエイトURL生成（ショップ別テンプレート）
- [ ] クリックログ（click_events テーブル）
- [ ] ショップ別CV計測準備
- [ ] 免責文強化
- [ ] キャッシュ時間管理（price_confidence連動）

---

## Phase 7: 一般公開準備 🔜

**完了条件:** 一般ユーザーが使える状態・法務・規約ページあり

- [ ] 禁止商品フィルター強化（blocked_keywords / blocked_categories）
- [ ] 通報機能（reported_products）
- [ ] 利用規約ページ
- [ ] プライバシーポリシーページ
- [ ] SEO（title / description / OGP）
- [ ] PWA アイコン作成（192x192 / 512x512）
- [ ] パフォーマンス改善（Core Web Vitals）
- [ ] Vercel 本番デプロイ

---

## 将来の拡張候補

| アイデア | 優先度 |
|---|---|
| 楽天・Yahoo!ショッピング・Qoo10追加 | ★★☆ |
| スマホアプリ化（React Native / Expo） | ★★☆ |
| 価格アラート（お気に入り商品の値下がり通知） | ★★★ |
| 海外展開（英語・中国語） | ★☆☆ |
| AI要約（レビューのサマリ） | ★☆☆ |
| カテゴリ別ランキング | ★★☆ |
