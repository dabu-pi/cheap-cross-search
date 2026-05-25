# ROADMAP — ECサイト比較.com

> **2026-05-25 新PC復元:** GitHub から clone（HEAD `764a101`）・npm ci/lint/typecheck/build 全 PASS・production smoke 4 URL OK。詳細は `docs/TRANSFER_TO_NEW_PC_2026-05-25.md`。
>
> **2026-05-25 AliExpress Affiliate 再申請 HOLD:** 登録不承認（site information invalid/non-compliant）。すぐに再申請せず、サイト運用開始 + 運営者情報/問い合わせ/正式URL/アフィリエイト表記等の整備後に再申請する。詳細は `docs/ALIEXPRESS_AFFILIATE_STATUS_2026-05-25.md`。
>
> **2026-05-25 楽天API復旧 原因切り分け（Phase 23B）:** コード（endpoint/param/encode/fallback/registry）は正しいことを検証（ダミーidで本番と同一の HTTP 400 wrong_parameter を再現）。原因は Vercel `RAKUTEN_APP_ID` の値が無効。**real_api 未復旧** — 人側で有効 applicationId を Vercel 更新 → redeploy が必須。詳細は `docs/RAKUTEN_API_RECOVERY_2026-05-25.md`。
>
> **2026-05-25 自動実施トライは認証で停止:** 楽天/Vercel ともログイン必須・Claude 側に対話ログイン手段/有効値/VERCEL_TOKEN/CLI が無いため手順1〜5 を実施できず。real_api 復旧は人側のブラウザ操作（Rakuten 確認 + Vercel env 更新 + redeploy）待ち。再開条件は §10 参照。
>
> **2026-05-25 復旧確認 → ⚠️ 未復旧:** ユーザーが env 更新+redeploy 実施後に確認したが、楽天は依然 link_only fallback（curl SSR 生HTML・X-Vercel-Cache:MISS・realOffers=0 を5回3クエリで確認）。原因は server側で、有効値が production runtime に届いていない疑い（env scope=Production か / redeploy が production promote 済みか / 値の空白混入 / Vercel Runtime Logs `[rakuten]` で切り分け）。**Phase 23B は OPEN 継続。** 詳細は `docs/RAKUTEN_API_RECOVERY_2026-05-25.md` §11。
>
> **2026-05-25 Phase 23C 新仕様対応（根本原因確定）:** 楽天ログは `specify valid applicationId`、アプリ画面に「アプリケーションID/アクセスキー/アフィリエイトID」あり → **旧 endpoint + applicationId のみが原因**と確定。商品検索API **2026-04-01**（`openapi.rakuten.co.jp/ichibams/.../20260401`・**accessKey 必須**・formatVersion=2）へアダプタを更新（新旧エラー/レスポンス両対応・secrets masked・lint/tsc/build PASS）。**人側で Vercel に `RAKUTEN_ACCESS_KEY`(Production) 追加 + redeploy が必要。** 詳細は §13。
>
> **2026-05-25 🔴 真因発見：Production が古い commit 配信:** Vercel Production の Source が `6cbef8e`（旧コード・accessKey 非対応・旧endpoint）のままで、最新 `7150d3a`（新仕様アダプタ・push済み）が一度も載っていなかった。env 変更が効かなかった真因。**6cbef8e の Redeploy では直らない** — Production Branch を `feature/phase8-supabase-vercel` に設定 or `7150d3a` の deployment を Promote が必要（Vercel 認証要・Claude 実施不可・認証境界で停止）。詳細は §14。
>
> **2026-05-25 Vercel CLI 本番化＋referrer 切り分け:** Claude が `vercel link`+`vercel --prod` で最新コード（HEAD `11163d4`）を Production 化（dpl READY・alias 反映）。runtime ログで段階切り分け → applicationId+accessKey 有効・新endpoint OK・Referer も node:https で楽天到達済（HTTPS E2E で改変不可）にもかかわらず `403 REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING`。⚠️ **未復旧。残ブロッカー＝楽天アプリの「リファラー(許可ドメイン)」未登録**（人側で `cheap-cross-search.vercel.app` を登録）。Phase 23B/23C OPEN。詳細は §15。

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
| 6 | 収益化（アフィリエイト）土台 | ✅ 完了（2026-05-24）| - |
| 7 | 安全公開準備・ポリシー | ✅ 完了（2026-05-24）| - |
| 8 | 本番Supabase接続・デプロイ準備 | ✅ 完了（0001+0002+0003 適用・DB保存確認・2026-05-24）| - |
| 9 | Vercel本番デプロイ確認 | ✅ 完了（P9-1〜P9-13 全確認・2026-05-24）| - |
| 5b | 実API/アフィリエイト調査・申請準備 | 🔄 進行中（Amazon✅ AliExpress❌不承認→HOLD Temu/SHEIN準備完了）| ★★★ |
| 10 | 実用検索・比較MVP | ✅ 完了（キーワード対応デモ・バナー/バッジ改善・2026-05-24）| - |
| 11 | 比較体験UI改善 | ✅ 完了（PriceComparisonBar・フィルター・ボタン改善・2026-05-24）| - |
| 12 | 比較ソート・実用導線強化 | ✅ 完了（ソート拡張・クリックフィルター連動・EmptyState改善・14/14 PASS・2026-05-24）| - |
| 13 | 外部検索導線・クリック計測準備 | ✅ 完了（CTA文言正確化・URL統一・クリック計測拡充・15/15 PASS・2026-05-24）| - |
| 14 | クリック計測・管理統計 | ✅ 完了（click_events DB確認・/admin/click-stats 追加・12/12 PASS・2026-05-24）| - |
| 15 | クリック計測実測確認・検索導線改善 | ✅ 完了（DB実データ15行確認・admin統計改善・全4ショップ確認・12/12 PASS・2026-05-24）| - |
| 16 | クリック分析UI改善・JST時刻・ソースラベル | ✅ 完了（JST時刻・7日間集計・カードCTAラベル・クエリリンク・12/12 PASS・2026-05-24）| - |
| 17 | 実APIアダプタ準備・デモ/実データ切替基盤 | ✅ 完了（型追加・ショップ状態明確化・スタブアダプタ・切替ガイド・12/12 PASS・2026-05-24）| - |
| 18 | Amazon アソシエイトタグ付与 | ✅ 完了（サーバーサイドタグ付与・RPC fix・10/10 PASS・2026-05-24）| - |
| 19 | Amazonタグ付きクリック分析・収益導線確認 | ✅ 完了（💰カード・🏷バッジ・SQL追加・5/5 PASS+5 skip・Phase9–18 全 PASS・2026-05-24）| - |
| 20 | SEO・信頼性・審査向け整備 | ✅ 完了（sitemap/robots/OGP/Twitter card・Amazon承認済み表記・15/15 PASS・2026-05-24）| - |
| 20A | 検索UI視認性・外部検索モード説明改善 | ✅ 完了（text-gray-900・外部検索モード説明・外部サイト誘導明記・15/15 PASS・production確認OK・2026-05-24）| - |
| 21 | 検索体験・カテゴリ導線改善 | ✅ 完了（カテゴリ別人気KW・関連KW候補・EmptyState改善・21/21 PASS・2026-05-24）| - |
| 22 | 実商品検索API PoC — 楽天・Yahoo! アダプタ | ✅ 完了（rakuten-ichiba.ts・yahoo-shopping.ts・6ショップ体制・20/20 PASS・2026-05-24）| - |
| 23B | 楽天API復旧 原因切り分け | ✅ 切り分け完了・⚠️ real_api 未復旧（OPEN・人側 env 追加+redeploy 待ち・2026-05-25）| ★★★ |
| 23C | 楽天API 2026-04-01 新仕様対応（accessKey 必須）| ✅ 実装完了（新 endpoint/accessKey/formatVersion=2・lint/tsc/build PASS・人側 RAKUTEN_ACCESS_KEY 追加+redeploy 待ち・2026-05-25）| ★★★ |

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

## Phase 6: 収益化（アフィリエイト）土台 ✅ 完了（2026-05-24）

**完了条件:** アフィリエイトリンク生成・クリック計測 Route・PR 表記が実装されている

- [x] アフィリエイトURL生成（`lib/affiliate/link-builder.ts`）
  - ID 未設定 → productUrl パススルー（安全フォールバック）
  - linkTemplate / trackingParams 両方式対応
- [x] クリック計測 Route（`/api/click`）
  - open redirect 対策（ALLOWED_DESTINATION_HOSTS 許可リスト）
  - https のみ許可
  - `Cache-Control: no-store` でキャッシュ防止
- [x] クリックイベント記録（`logClickEvent`）— no-op（Supabase 設定後に有効化）
- [x] ProductCard PR バッジ・`rel=sponsored`・アフィリエイト注意文
- [x] 管理画面 `/admin/affiliate` 強化（セキュリティ警告・tracking params・テストプレビュー）
- [x] 免責事項ページ強化（アフィリエイト開示・クリック計測説明）
- [x] 検索ページ PR 開示ノート
- [x] `docs/AFFILIATE_TRACKING_DESIGN.md` — DB スキーマ設計書
- [ ] アフィリエイトプログラム申請後: `affiliate_settings` テーブルに実 ID を INSERT → 有効化
- [ ] Supabase 設定後: `click_events` DB INSERT 有効化

---

## Phase 7: 安全公開準備・ポリシー ✅ 完了（2026-05-24）

**完了条件:** 安全フィルター・通報導線・ポリシーページの土台が整っている

- [x] 安全フィルター型定義（`src/lib/safety/types.ts`）
- [x] 安全ルール定義（`src/lib/safety/rules.ts`）— blocked 17 / caution 12
- [x] フィルター実装（`src/lib/safety/filter-product-offers.ts`）
- [x] 検索ページへの安全フィルター統合（除外件数・注意件数バナー）
- [x] ProductCard 要注意ラベル・「⚑」報告リンク
- [x] 問題報告ページ（`/report`）— デモモード
- [x] 利用規約ページ（`/terms`）
- [x] プライバシーポリシーページ（`/privacy`）
- [x] 安全ポリシーページ（`/safety-policy`）— ルールから自動生成
- [x] トップページ フッターナビ
- [x] 管理画面 blocked-keywords 強化（稼働中ルール表示）
- [x] 公開チェックリスト（`docs/SAFETY_PUBLICATION_CHECKLIST.md`）
- [ ] 通報 DB 保存（`reported_products` テーブル）→ Supabase 設定後
- [ ] `blocked_keywords` テーブルへの移行 → 管理画面から動的編集
- [ ] ポリシーページの法的レビュー → 公開前に弁護士確認推奨

## Phase 8: 本番Supabase接続・デプロイ準備 ✅ 完了（実装・2026-05-24）

**完了条件（実装部分）:** SQL・手順書・DB INSERT 実装が揃い、手動適用のみ残った状態

- [x] `supabase/migrations/0002_tracking_reports_admin.sql` 作成（click_events / reported_products / admin_users / affiliate_settings / blocked_keywords）
- [x] RLS ポリシー設計・実装（全5テーブル）
- [x] click_events DB INSERT 有効化（Supabase 設定済み時）
- [x] reported_products DB INSERT 有効化（Supabase 設定済み時）
- [x] `src/lib/admin/auth.ts` — `isAdmin()` / `requireAdmin()` ヘルパー
- [x] `docs/VERCEL_DEPLOYMENT.md` — Vercel デプロイ手順書
- [x] `docs/SUPABASE_SETUP.md` — Phase 8 テーブル・手順追記
- [x] live-check-runner `phase8-supabase-vercel-verify.spec.ts` — 10/10 PASS
- [x] **完了:** Supabase プロジェクト作成・`.env.local` 設定（2026-05-24）
- [x] **完了:** SQL マイグレーション適用（0001 + 0002 実行済み・2026-05-24）
- [x] **完了:** /report INSERT 失敗修正（0003 hotfix 作成・2026-05-24）
- [ ] **手動実施待ち:** `0003_fix_reported_products_insert_policy.sql` を Supabase SQL Editor で実行
- [ ] **手動実施待ち:** /report 送信テスト（reported_products に行が追加される確認）
- [ ] **手動実施待ち:** Google OAuth 有効化
- [ ] **手動実施待ち:** 管理者ユーザー登録（admin_users INSERT）
- [ ] **手動実施待ち:** Vercel 本番デプロイ
- [ ] アフィリエイトプログラム申請・ID 設定（申請後）
- [ ] SEO（title / description / OGP）
- [ ] PWA アイコン作成（192x192 / 512x512）
- [ ] カスタムドメイン設定

---

---

## Phase 12: 比較ソート・実用導線強化 ✅ 完了（2026-05-24）

**完了条件:** ソート機能拡充・PriceComparisonBar とショップフィルターが連動・EmptyState が実用的な案内を表示

- [x] `sort.ts`: `price_desc`（参考価格が高い順）・`shop_order`（ショップ順）追加
- [x] `sort.ts`: デフォルトソート → `price_asc`
- [x] `PriceComparisonBar.tsx`: `'use client'`・クリック可能・`selectedShop`/`onShopSelect` props
- [x] `ComparisonSection.tsx`（新規）: PriceComparisonBar ↔ ProductCardGrid 間の shopFilter 共有ラッパー
- [x] `ProductCardGrid.tsx`: 外部制御モード対応（`shopFilter`/`onShopFilterChange` props）
- [x] `search/page.tsx`: EmptyState 人気キーワード候補・「何を比較しますか」案内
- [x] live-check-runner `phase12-sort-navigation-verify.spec.ts` — **14/14 PASS**
- [x] Phase 9/10/11 regression すべて PASS（Phase 11 spec を Phase 12 変更に合わせて更新）
- [x] Vercel deploy `dpl_EBGf7AZrmcvcvEJHJUs9TU9beoSh` — READY

---

## Phase 13: 外部検索導線・クリック計測準備 ✅ 完了（2026-05-24）

**完了条件:** CTA文言が実態に合っている・外部リンクが安全・クリック計測が機能している

- [x] `ProductOffer` に `isSearchPage?: boolean` 追加（型定義）
- [x] `demo-results.ts`: `buildSearchUrl()` で URL 生成を `shops.ts` に統一
- [x] `demo-results.ts`: `isSearchPage: true` を全デモオファーに設定
- [x] `ProductCard.tsx`: CTA テキストを `isSearchPage` で切り替え（「で検索」/ 「で見る」）
- [x] `search/page.tsx`: 直接検索リンクを `/api/click?source=direct_search` 経由に変更
- [x] 全外部リンクに `target="_blank"` / `rel="noopener noreferrer"` が付与
- [x] 未承認アフィリエイト表現なし
- [x] live-check-runner `phase13-external-search-cta-verify.spec.ts` — **15/15 PASS**
- [x] Phase 9/10/11/12 regression すべて PASS（Phase 11 spec を Phase 13 変更に合わせて更新）
- [x] Vercel deploy `dpl_Dwpckt21NT94g9AusUKrBGcVQ8Gc` — READY

---

## Phase 18: Amazon アソシエイトタグ付与 ✅ 完了（2026-05-24）

**完了条件:** Amazon Associates の承認済み affiliate_id を Amazon 検索リンクに安全に付与。PA-API は使わない。affiliate_id はコード・ログに残さない。

- [x] `search/page.tsx`: `getAmazonAffiliateTag()` — Supabase RPC 経由でサーバーサイド取得
- [x] `search/page.tsx`: `applyAmazonTag()` — `?tag=` パラメータを Amazon URL に付与
- [x] `search/page.tsx`: `offersWithTags` — Amazon offer の `affiliateUrl` に tag 付き URL をセット（`productUrl` は変更しない）
- [x] SHEIN / AliExpress / Temu は対象外（affiliateApprovalStatus が approved でないため）
- [x] Supabase DB: `SECURITY DEFINER` 関数 `get_amazon_affiliate_tag()` 作成 + `GRANT EXECUTE TO anon`
- [x] Supabase DB: `affiliate_settings: admin all` RLS ポリシーを `auth.uid() IS NOT NULL AND EXISTS(...)` に修正（anon の admin_users 権限問題を回避）
- [x] affiliate_id 自体はクライアント props に渡さず、生成済みタグ付き URL のみをシリアライズ
- [x] `/api/click` の ALLOWED_DESTINATION_HOSTS は `www.amazon.co.jp` を含むためリダイレクトそのまま動作
- [x] live-check-runner `phase18-amazon-affiliate-tag-verify.spec.ts` — **10/10 PASS**
- [x] Phase 10〜17 regression: 179/188 PASS（9 failures は Phase 3〜6 の stale spec — 事前から継続）
- [x] Vercel deploy `dpl_5g1zSrsxDVVr8d5NMmqmZdCsm5Zd` — READY

**技術的な対応点（RLS 権限問題）:**
- `affiliate_settings` の "admin all" RLS ポリシーが `admin_users` を参照しており
  anon ロールが `GRANT SELECT ON admin_users` を持たないため 401 エラーが発生
- PostgreSQL はパース時に権限チェックするため短絡評価（`auth.uid() IS NOT NULL AND`）では回避不可
- `SECURITY DEFINER` 関数でラップすることで anon が直接 affiliate_settings を読まずに値を取得

---

## Phase 19: Amazonタグ付きクリック分析・収益導線確認 ✅ 完了（2026-05-24）

**完了条件:** Amazon アフィリエイトタグ付きリンクが実クリック計測に正しく反映され、管理画面で収益導線を確認できる。affiliate_id 実値は管理者にも非表示。

- [x] `admin/click-stats/page.tsx`: Phase 19 Amazon アフィリエイトタグ付きクリック集計変数追加
  - `amazonTotalCount` / `amazonTaggedCount` / `amazonTagRatio`
- [x] `admin/click-stats/page.tsx`: 💰 Amazonアフィリエイト導線 サマリカード追加
  - タグ付き件数 / Amazon 合計件数 / タグ付き率 % のプログレスバー
  - データなし時のエンプティステート対応
  - affiliate_id 実値は表示しない（フラグのみ）
- [x] `admin/click-stats/page.tsx`: 直近クリックテーブルに 🏷 バッジ追加
  - Amazon 行で `clicked_url` に `tag=` が含まれる場合のみ表示
  - SHEIN / AliExpress / Temu には表示しない
- [x] `admin/click-stats/page.tsx`: SQL メモに Amazon タグ付きクリック集計クエリ追加
- [x] live-check-runner `phase19-amazon-affiliate-analysis-verify.spec.ts` — **5/5 PASS + 5 skip（認証なし環境）**
- [x] Phase 9–18 全 regression PASS:
  - Phase 9: 11 passed / 2 skipped
  - Phase 10: 8 passed
  - Phase 11: 12 passed
  - Phase 12: 14 passed
  - Phase 13: 15 passed
  - Phase 14: 12 passed
  - Phase 15: 12 passed
  - Phase 16: 12 passed
  - Phase 17: 12 passed
  - Phase 18: 10 passed
- [x] TypeScript check: エラー 0
- [x] Vercel deploy `dpl_8DH621MKBP3S3D12Qzs6kDt13qBe` — READY
- [x] https://cheap-cross-search.vercel.app にて確認可能

**セキュリティ確認:**
- affiliate_id 実値はコード・ログ・テスト出力に含まない
- 管理画面の表示は「タグ付き/いいえ」フラグのみ（実値非表示）
- P19-6: `/admin/click-stats` の可視テキストに `-22` 形式の Associates tag が露出しないことを確認済み

---

## Phase 20: SEO・信頼性・審査向け整備 ✅ 完了（2026-05-24）

**完了条件:** ECサイト比較.com としての SEO 基礎、sitemap/robots、policy ページ表記の整合。

- [x] `src/lib/config/site.ts` 追加: SITE_URL 定数（カスタムドメイン移行時はここだけ変更でよい）
- [x] `src/app/layout.tsx` 更新:
  - `metadataBase: new URL(SITE_URL)` 追加（絶対 URL OGP 生成に必要）
  - `title.template` 追加（ページ固有 title + サービス名）
  - `openGraph.url` / `openGraph.siteName` 追加
  - Twitter card (`summary`) 追加
  - `robots: { index: true, follow: true }` 追加
- [x] `src/app/sitemap.ts` 新規作成: `/sitemap.xml` 自動配信
  - トップ / /search / /disclaimer / /terms / /privacy / /safety-policy
  - /admin / /api / /account / /favorites は除外
- [x] `src/app/robots.ts` 新規作成: `/robots.txt` 自動配信
  - /admin / /api / /account / /favorites / /auth/ を Disallow
  - sitemap URL を記載
- [x] `src/app/disclaimer/page.tsx` アフィリエイト表記を現状に合わせて更新:
  - Amazon アソシエイト: 「参加を予定」→「参加中・適格販売から収入を得ることがあります」
  - AliExpress: 「申請中・審査結果待ち」
  - Temu / SHEIN: 「参加を検討中・未申請」
  - affiliate_id 実値は表示しない
- [x] live-check-runner `phase20-seo-trust-verify.spec.ts` — **15/15 PASS**
- [x] TypeScript check: エラー 0 / build 成功
- [x] Vercel deploy `dpl_HrzgwH4RjCWfXUfYuA9zHKNU2QNK` — READY

**メモ: カスタムドメイン移行時の手順**

1. `src/lib/config/site.ts` の SITE_URL を新ドメインに変更
2. (または) Vercel 環境変数 `NEXT_PUBLIC_SITE_URL` に新ドメインを設定
3. sitemap.xml / robots.txt は自動的に新ドメインで再生成される

---

## Phase 20A: 検索UI視認性・外部検索モード説明改善 ✅ 完了（2026-05-24）

**背景:** ユーザー実機確認で検索入力欄の文字が読みにくい問題と、
現在の「外部検索モード」（各ショップの検索結果ページへ遷移）がユーザーに分かりにくい問題を確認。

**完了条件:** 検索入力が白背景でも明確に読める。現状が外部検索モードであることが自然に伝わる。

- [x] `src/components/search/SearchBar.tsx`:
  - input に `text-gray-900` 追加（入力文字を濃い色に）
  - `placeholder:text-gray-400` 追加（placeholder も読める色に）
- [x] `src/app/search/page.tsx`:
  - 「参考価格を表示中」バナーに「外部検索モード」説明を追加:
    「現在は各ECサイトの検索結果ページへご案内します。実際の価格・在庫・商品詳細は遷移先のショップでご確認ください。」
  - 外部検索 CTA セクションに「ボタンを押すと各ECサイトの検索結果ページが開きます」注釈追加
- [x] 商品カード CTA は「Amazonで検索」（`isSearchPage: true`）であること確認 → 変更不要
- [x] live-check-runner `phase20a-search-ui-verify.spec.ts` — **15/15 PASS**
- [x] Phase 9–20 regression: 全 PASS
- [x] Vercel deploy `dpl_3VkUiAS6fGgwStKDFZ8db83fTdvE` — READY
- [x] **production 実機確認 OK（2026-05-24）** — 「検索視認確認、OKです。問題ありません。」「現段階ではこれでいいんじゃないかな」（ユーザー判断・CLOSED）

**将来の商品ページ直リンク化方針（Roadmap 記録）:**

現在は実 API 未連携のため、各ショップの検索結果ページへ誘導する「外部検索モード」で動作している。
将来の API 連携後、以下の段階で商品ページ直リンクへ進化させる。

| フェーズ | 条件 | 実装内容 |
|---|---|---|
| Amazon PA-API 有効化 | アソシエイト売上3件後に自動有効化 | PA-API でリアルタイム商品検索 → 個別商品 URL → `isSearchPage: false` |
| AliExpress Portals API | Portals 審査承認後 | AliExpress API 連携 → 商品詳細 URL |
| SHEIN / Temu | 申請・承認後 | 各 API 連携後に順次対応 |

- `isSearchPage: false` にすると ProductCard CTA が「Amazonで見る」（商品詳細ページ）に切り替わる実装済み
- `ProductOffer.affiliateUrl` / `productUrl` の切り替えで対応可能な構造になっている

---

## Phase 21: 検索体験・カテゴリ導線改善 ✅ 完了（2026-05-24）

**背景:** Phase 20A production 確認 OK（「現段階ではこれでいい」）後、検索体験・カテゴリ導線の改善を実施。

**完了条件:** トップページにカテゴリ別人気キーワードが表示される。検索結果ページに関連キーワード候補がある。EmptyStateがカテゴリ別になっている。

- [x] `src/app/page.tsx`:
  - `POPULAR_QUERIES` フラットリストを `CATEGORY_QUERIES` カテゴリ別構造に刷新
  - 家電・ガジェット / ファッション・バッグ / スポーツ・健康 / 日用品・ペット の4カテゴリ
  - ユーザー指定キーワード（スマホケース・ワイヤレスイヤホン・バッグ・プロテイン・ペット用品）を包含
  - 「現在の動作モード」ブロックで外部検索モード説明を自然に追加
- [x] `src/app/search/page.tsx`:
  - `CATEGORY_QUERIES` と `RELATED_KEYWORDS_MAP` を追加
  - `getRelatedKeywords(query)` ヘルパー（完全一致 → 部分一致 → フォールバック）
  - `RelatedKeywords` コンポーネント（「🔗 こんなキーワードも人気」セクション）を SearchResults 末尾に追加
  - `EmptyState` を大幅改善: カテゴリ別人気キーワード + 外部検索モード説明 + 使い方ガイド
- [x] live-check-runner `phase21-search-experience-verify.spec.ts` — **21/21 PASS**
- [x] Phase 9–20A regression: 全 PASS（P21-13〜P21-21 で確認）
- [x] Vercel deploy `dpl_A5sRhYAXxJhhhtmjK6FSWVXPNwvv` — READY (production)

---

## Phase 22: 実商品検索API PoC — 楽天市場 / Yahoo!ショッピング ✅ 完了（2026-05-24）

**背景:** Amazon PA-API / AliExpress Portals は利用待ちのため、即日APIキー取得可能な楽天市場・Yahoo!ショッピングで実商品検索 PoC を先行実装。

**完了条件:** アダプタが実装され、APIキーを設定するだけで実商品が表示できる状態になっていること。APIキー未設定時は link_only に安全フォールバック。

- [x] `src/lib/search/adapters/rakuten-ichiba.ts` — 楽天ウェブサービス商品検索API アダプタ
  - `RAKUTEN_APP_ID` 設定済み → 実商品・実価格取得、`isSearchPage: false`、`priceConfidence: 'high'`
  - 未設定 → link_only フォールバック（警告付き）
- [x] `src/lib/search/adapters/yahoo-shopping.ts` — Yahoo!ショッピング WebAPI V3 アダプタ
  - `YAHOO_APP_ID` 設定済み → 実商品・実価格取得、`isSearchPage: false`、`priceConfidence: 'high'`
  - 未設定 → link_only フォールバック（警告付き）
- [x] `src/lib/shops/shops.ts` — 楽天・Yahoo! を6番目・7番目のショップとして追加
  - `integrationMode: 'official_api'`、`dataStatus: 'external_search'`（APIキー設定後に `real_api` へ）
- [x] `src/lib/search/adapters/registry.ts` — `official_api` ケースに楽天・Yahoo! を登録
- [x] `next.config.ts` — 楽天・Yahoo! 画像ドメインを `remotePatterns` に追加
- [x] `.env.local.example` — `RAKUTEN_APP_ID` / `YAHOO_APP_ID` 追記
- [x] `src/app/page.tsx` — ヒーロー文言を「6ショップをまとめて比較」に更新
- [x] `src/app/search/page.tsx` — 実API データ取得時の通知バナーを追加（`hasRealApiOffers`）
- [x] `docs/API_AFFILIATE_RESEARCH.md` — Phase 22 PoC 実装詳細を記録
- [x] live-check-runner `phase22-real-api-poc-verify.spec.ts` — **20/20 PASS**
- [x] Phase 9–21 regression: 全 PASS（P22-9〜P22-20 で確認）
- [x] Vercel deploy `dpl_H4dF14JMoN8CBvwAWGuZSSdhgchG` — READY (production)

**APIキー有効化手順（人が実施）:**

| ショップ | 取得先 | 環境変数 | 料金 |
|---|---|---|---|
| 楽天市場 | https://webservice.rakuten.co.jp/ | `RAKUTEN_APP_ID` | 無料・即日 |
| Yahoo!ショッピング | https://developer.yahoo.co.jp/ | `YAHOO_APP_ID` | 無料・即日 |

Vercel: Project Settings > Environment Variables に設定後 `vercel --prod` で即有効化。

---

## Phase 23: 楽天市場 real_api 有効化 ⚠️ 要対応（applicationId 確認中・2026-05-24）

**背景:** Phase 22 で実装済みのアダプタに `RAKUTEN_APP_ID` を Vercel に設定し、
楽天市場を `dataStatus: 'external_search'` → `'real_api'` へ移行。

**実施内容:**

- [x] `RAKUTEN_APP_ID` を Vercel Production/Preview に設定（値は非公開）
- [x] `src/lib/shops/shops.ts` — 楽天 `dataStatus: 'external_search'` → `'real_api'`
  - Yahoo!ショッピングは `YAHOO_APP_ID` 未取得のため `external_search` 維持
- [x] TypeScript チェック / ESLint — エラーなし
- [x] commit `811b2c1` — push 済み

**問題:** Vercel に設定した `RAKUTEN_APP_ID` の値が無効
- 楽天 API → HTTP 400 / `wrong_parameter` / `specify valid applicationId`
- https://webservice.rakuten.co.jp/ のアプリ一覧で `applicationId`（アプリID）を確認し再設定が必要

**次のアクション（人が実施）:**
1. https://webservice.rakuten.co.jp/ → アプリ一覧 → アプリID（applicationId）をコピー
2. Vercel: Settings > Environment Variables > `RAKUTEN_APP_ID` を正しい値に更新（Sensitive ON）
3. Redeploy → 楽天実商品が表示されることを確認

---

## Phase 23A: 楽天 API エラー fallback 修正 ✅ 完了（2026-05-24）

**背景:** Phase 23 で applicationId が無効 → 楽天が「エラー」表示になる問題を修正。

**実施内容:**

- [x] `src/lib/search/adapters/rakuten-ichiba.ts`
  - API 非 OK 時: レスポンス本文をログ出力（secrets なし）
  - catch block: `status: 'error'` → `status: 'link_only'` fallback に変更
  - `console.error` でマスク済みエラーを Vercel logs に記録
- [x] `src/components/search/ShopCard.tsx` — `StatusBadge`: `status === 'link_only'` にも「検索対応」バッジ
- [x] TypeScript (`tsc --noEmit`) — エラーなし
- [x] ESLint (`npm run lint`) — エラーなし
- [x] commit `6cbef8e` — push 済み
- [x] Vercel Production deploy `dpl_5Nvk24wASG4NNcyqF5o7suPrnF9f` — READY
- [x] エラー原因確認: HTTP 400 / `wrong_parameter` / `specify valid applicationId`

**現在の UX:** 楽天は「検索対応」バッジ + 「楽天で検索」ボタン（エラー表示なし）

**次の実商品 API 有効化候補:**

| ショップ | 状態 |
|---|---|
| 楽天市場 | ⚠️ applicationId 再設定待ち（現在 link_only fallback） |
| Yahoo!ショッピング | 🔜 `YAHOO_APP_ID` 取得後に有効化 |

---

## Phase 23B: 楽天実商品表示 有効化（次回・人が RAKUTEN_APP_ID を再設定後に実施）

**前提条件（人が実施してから Claude に依頼）:**

1. https://webservice.rakuten.co.jp/ → アプリ一覧 → **アプリID（applicationId）** を確認
   - affiliateId（アフィリエイトID）とは別物。アプリID を使うこと
   - 形式：長い英数字または数字のみの文字列
2. Vercel: Project `cheap-cross-search` > Settings > Environment Variables
   - `RAKUTEN_APP_ID` の値を正しい applicationId に更新
   - Sensitive: ON / Environments: Production, Preview
   - 実値はチャット・docs・git に記録しない
3. Claude に「Vercel に RAKUTEN_APP_ID を更新した」と伝える

**Claude が実施する作業:**

- [ ] `vercel env ls` で `RAKUTEN_APP_ID` が Production/Preview に Encrypted として確認
- [ ] `vercel --prod` で Production Redeploy
- [ ] Vercel logs で `[rakuten] API` エラーが出なくなることを確認
- [ ] 確認URL で楽天実商品カードが表示されることを確認:
  - https://cheap-cross-search.vercel.app/search?q=%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%AC%E3%82%B9%E3%82%A4%E3%83%A4%E3%83%9B%E3%83%B3
  - https://cheap-cross-search.vercel.app/search?q=%E3%82%B9%E3%83%9E%E3%83%9B%E3%82%B1%E3%83%BC%E3%82%B9
- [ ] 確認項目（実商品カード）: 商品名・価格・画像・ショップ名・「楽天で見る」CTA・商品ページ直リンク
- [ ] PROJECT_STATUS.md / ROADMAP.md に Phase 23B 完了を記録
- [ ] commit / push / clean / 0/0

**RAKUTEN_ACCESS_KEY について:**
不要。楽天ウェブサービス IchibaItem/Search API は `applicationId` のみで動作する。

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
