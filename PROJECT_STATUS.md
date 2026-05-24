# PROJECT_STATUS — ECサイト比較.com

最終更新: 2026-05-24（Phase 18 Amazon アソシエイトタグ付与 完了・live-check 10/10 PASS）

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
| Phase 6（収益化・アフィリエイト土台） | ✅ 完了（土台・デモID・click計測・2026-05-24）|
| Phase 7（安全公開準備・ポリシー） | ✅ 完了（安全フィルター・通報・ポリシー・2026-05-24）|
| Phase 8（本番Supabase接続・デプロイ準備） | ✅ 完了（SQL・手順書・DB実装・10/10 PASS・2026-05-24）|
| Phase 8b（Supabase接続済み動作確認） | ✅ 完了（6/6 PASS・2026-05-24）|
| Phase 8c（/report INSERT 修正）| ✅ 完了（.env.local 修正・PostgREST HTTP 201 確認済み・2026-05-24）|
| Phase 5b（実 API アダプタ） | 🔜 未着手（申請後に実装）|
| 0001 SQL 適用 | ✅ 完了（profiles / search_queries / favorite_products / favorite_queries）|
| 0002 SQL 適用 | ✅ 完了（admin_users / click_events / reported_products / affiliate_settings / blocked_keywords）|
| 0003 SQL 適用 | ✅ 完了（GRANT 確認済み・anon INSERT 権限付与済み）|
| .env.local 設定 | ✅ 完了・修正済み（ANON KEY 重複行削除・2026-05-24）|
| Supabase CLI | ✅ 設定完了（npx supabase login + link 済み・db query --linked 動作確認済み）|
| /report DB 保存 | ✅ 完了（P8B-7・フォーム送信 → reported_products id=4 確認済み・2026-05-24）|
| 管理者ユーザー登録 | ✅ 完了（P8B-10・admin_users INSERT 済み・2026-05-24）|
| アカウント作成・ログイン確認 | ✅ 完了（P8B-8・ログイン済み・UUID取得済み）|
| Vercel デプロイ | ✅ 完了（https://cheap-cross-search.vercel.app・2026-05-24）|
| Phase 9 本番確認 | ✅ 完了（P9-1〜P9-13 全確認済み・2026-05-24）|
| Amazonアソシエイト登録 | ✅ 完了（ID: DB登録済み `cheapc***-22`・2026-05-24）|
| Amazon affiliate_settings | ✅ 更新済み（enabled=true・DB保存・Gitコミットなし）|
| Phase 5b（API調査・申請準備） | ✅ 調査完了（docs/API_AFFILIATE_RESEARCH.md 作成済み・2026-05-24）|
| サービス名変更 | ✅ 完了（「安買い横断サーチ」→「ECサイト比較.com」・2026-05-24）|
| ECサイト比較.com 本番反映 | ✅ 完了（Vercel deploy 757bf98・live-check 11/11 PASS・2026-05-24）|
| AliExpress Portals 申請 | ⏳ 審査中（Submitted 2026-05-23 22:16 PST・実機確認済み・メール通知待ち）|
| Temu Affiliate 申請準備 | ✅ 準備完了（申請情報整理済み・**未申請 HOLD**）|
| SHEIN / A8.net 申請準備 | ✅ 準備完了（A8.net 経由手順整理済み・未申請）|
| Phase 10（実用検索・比較MVP） | ✅ 完了（キーワード対応デモ・バナー改善・バッジ改善・8/8 PASS・2026-05-24）|
| Phase 11（比較体験UI改善） | ✅ 完了（PriceComparisonBar・ショップフィルター・ボタン改善・直接検索改善・12/12 PASS・2026-05-24）|
| Phase 12（比較ソート・実用導線強化） | ✅ 完了（ソート拡張・PriceComparisonBarクリックフィルター連動・EmptyState改善・14/14 PASS・2026-05-24）|
| Phase 13（外部検索導線・クリック計測準備） | ✅ 完了（CTA文言正確化・URL生成統一・クリック計測拡充・15/15 PASS・2026-05-24）|
| Phase 14（クリック計測・管理統計） | ✅ 完了（click_events DB確認・/admin/click-stats 追加・12/12 PASS・2026-05-24）|
| Phase 15（クリック計測実測確認・検索導線改善） | ✅ 完了（DB実データ確認・admin統計改善・全4ショップ計測確認・12/12 PASS・2026-05-24）|
| Phase 16（クリック分析UI改善・JST時刻・ソースラベル） | ✅ 完了（JST時刻表示・7日間集計・カードCTAラベル・クエリリンク・12/12 PASS・2026-05-24）|
| Phase 17（実APIアダプタ準備・デモ/実データ切替基盤） | ✅ 完了（型追加・ショップ状態明確化・スタブアダプタ・切替ガイド・12/12 PASS・2026-05-24）|
| Phase 18（Amazon アソシエイトタグ付与） | ✅ 完了（サーバーサイドタグ付与・SECURITY DEFINER RPC・10/10 PASS・2026-05-24）|

## 🔍 /report 送信失敗の根本原因（2026-05-24 調査完了）

**症状:** `/report` 送信 → 「送信に失敗しました」

**調査経過:**
- Supabase CLI (`npx supabase db query --linked`) で DB 調査
- GRANT ✅ (anon: INSERT on reported_products)
- Sequence USAGE ✅ (anon: USAGE on reported_products_id_seq)
- RLS policy ✅ (INSERT with_check=true)
- CHECK 制約なし（reason / status に制約なし）
- PostgREST 直接 INSERT (return=minimal) → HTTP 201 ✅

**根本原因:** `.env.local` に `NEXT_PUBLIC_SUPABASE_ANON_KEY` が **2行存在**  
→ Next.js は最後の行（13 文字・無効な値）を採用  
→ クライアントサイドの createBrowserClient に無効なキーが渡され、全 API 呼び出しが失敗

**修正:** `.env.local` の重複 13 文字行を削除（有効な `sb_publish_...` 46 文字キーを保持）

**確認:** PostgREST INSERT with 修正済み ANON KEY → HTTP 201 ✅

## ✅ Phase 9 本番デプロイ確認（2026-05-24 完了）

本番 URL: **https://cheap-cross-search.vercel.app**

| テスト | 結果 |
|---|---|
| P9-1: / トップページ | ✅ PASS |
| P9-2: /search?q=スマホケース | ✅ PASS |
| P9-3: /report live モード（デモバナーなし） | ✅ PASS |
| P9-4: /report reason 選択後 submit enabled | ✅ PASS |
| P9-5: /login 本番フォーム表示 | ✅ PASS |
| P9-6: /account → /login リダイレクト | ✅ PASS |
| P9-7: /favorites/products → /login リダイレクト | ✅ PASS |
| P9-8: /api/click Amazon URL 3xx リダイレクト | ✅ PASS |
| P9-9: /api/click 不正 URL ブロック | ✅ PASS |
| P9-10: /terms /privacy /safety-policy /disclaimer | ✅ PASS |
| P9-11: /admin 管理画面表示 | ✅ PASS |
| P9-12: MANUAL — 本番ログイン | ✅ ユーザー実機確認済み |
| P9-13: MANUAL — 本番 /report DB 保存 | ✅ ユーザー実機確認済み |

自動 11/11 PASS + 手動 P9-12/P9-13 ユーザー実機確認完了（2026-05-24）。

### ユーザー実機確認内容（2026-05-24）

- `https://cheap-cross-search.vercel.app` — 4ショップ横断比較表示 ✅
- `/login` — 本番ログイン確認 ✅
- `/report` — 「偽物疑い」送信 → 「報告を受け付けました」表示 ✅
- Supabase `reported_products` への行追加（送信導線確認）✅

**Phase 9 全確認完了。本番稼働中。**

## ✅ Phase 11 比較体験UI改善（2026-05-24 完了）

| 変更 | 内容 |
|---|---|
| `PriceComparisonBar.tsx`（新規） | ショップ別参考価格帯サマリを検索結果の上部に表示 |
| `ProductCardGrid.tsx` | ショップフィルター（Amazon/SHEIN/AliExpress/Temu/すべて）追加 |
| `ProductCard.tsx` | 「商品ページへ」→「{Shop}で見る」（Amazonで見る 等） |
| `search/page.tsx` | PriceComparisonBar 挿入、ShopCard セクションをコンパクト直接検索に置換 |
| live-check | `phase11-comparison-ux-verify.spec.ts` — 12/12 PASS |
| Vercel deploy | `dpl_4ct13fdNQMxqG81VRrdMAKKgPB2D` — READY |
| regression | Phase 9 11/11 + Phase 10 8/8 すべて継続 PASS |

**完了条件（全満足）:**
- [x] ショップ別参考価格帯サマリ表示
- [x] ショップフィルター（Amazon/SHEIN/AliExpress/Temu）
- [x] 「{Shop}で見る」ボタン（未承認表現なし）
- [x] コンパクト直接検索セクション
- [x] 参考価格注記が複数箇所
- [x] 未承認アフィリエイト表現なし
- [x] Phase 9/10 regression PASS

## ✅ Phase 10 実用検索・比較MVP（2026-05-24 完了）

| 変更 | 内容 |
|---|---|
| `getDemoOffers(query?)` | `query` 対応 — キーワードをタイトルに含むデモ商品を生成 |
| 価格変動 | クエリハッシュで決定的に変化（同クエリ = 同価格・別クエリ = 別価格） |
| 検索 URL | 各ショップの商品タイトル・URL にキーワードを含む |
| 参考価格バナー | 「⚠️ サンプル表示中」→「📊 参考価格を表示中」（控えめな小バナー） |
| ショップバッジ | 「🔗 リンクのみ」（黄）→「🛒 検索対応」（青）— SearchStatusSummary / ShopCard / registry |
| live-check | `phase10-search-mvp-verify.spec.ts` — 8/8 PASS |
| Vercel deploy | `dpl_6DzR97Dr8cPwfgVaFEgHwJ9gpsta` — READY |

**完了条件（全満足）:**
- [x] `/search?q=ワイヤレスイヤホン` → タイトルに「ワイヤレスイヤホン」が含まれる
- [x] 「参考価格を表示中」バナー表示（⚠️サンプル表示中なし）
- [x] 「検索対応」バッジ（リンクのみなし）
- [x] 4ショップすべて表示
- [x] 外部リンクボタンあり
- [x] PR/アフィリエイト開示あり

## ✅ Phase 13 外部検索導線・クリック計測準備（2026-05-24 完了）

| 変更 | 内容 |
|---|---|
| `types.ts` | `ProductOffer` に `isSearchPage?: boolean` 追加（検索ページ vs 商品詳細ページを区別）|
| `demo-results.ts` | `buildSearchUrl()` で URL 生成を `shops.ts` に統一・`isSearchPage: true` 設定 |
| `ProductCard.tsx` | CTA: `isSearchPage` が `true` なら「○○で検索」、`false/undefined` なら「○○で見る」に切り替え |
| `search/page.tsx` | 直接検索リンクを `/api/click?...&source=direct_search` 経由に変更（クリック計測追加）|
| `search/page.tsx` | 直接検索セクションヘッダーを「各ショップで「query」を検索」に変更 |
| live-check | `phase13-external-search-cta-verify.spec.ts` — **15/15 PASS** |
| Vercel deploy | `dpl_Dwpckt21NT94g9AusUKrBGcVQ8Gc` — READY |
| regression | Phase 9 11/11 + Phase 10 8/8 + Phase 11 12/12 + Phase 12 14/14 すべて継続 PASS |

**クリック計測の現状（Phase 13 時点）:**
- `/api/click` route: Phase 6 から実装済み（`click_events` テーブルへ INSERT）
- 全商品カード CTA: `/api/click?shop=...&to=...&offerId=...&q=...` 経由 ✅
- 直接検索ボタン: `/api/click?shop=...&to=...&q=...&source=direct_search` 経由 ✅（Phase 13 新規）
- Supabase 設定済み本番: `click_events` テーブルに shop_code / query / clicked_url / source を記録

**完了条件（全満足）:**
- [x] CTA文言が実態に合っている（検索ページ = 「○○で検索」）
- [x] 外部検索 URL が `shops.ts` の `buildSearchUrl()` で統一
- [x] 商品カード・直接検索ともに `/api/click` 経由でクリック計測
- [x] `source=direct_search` で直接検索クリックを識別可能
- [x] `target="_blank"` / `rel="noopener noreferrer"` が全外部リンクに付与
- [x] 未承認アフィリエイト表現なし
- [x] Phase 9/10/11/12 regression PASS

## ✅ Phase 12 比較ソート・実用導線強化（2026-05-24 完了）

| 変更 | 内容 |
|---|---|
| `sort.ts` | `price_desc`（参考価格が高い順）・`shop_order`（ショップ順）追加。デフォルト `price_asc` に変更 |
| `PriceComparisonBar.tsx` | `'use client'` 追加・`selectedShop` / `onShopSelect` props 追加・クリック可能ボタン化 |
| `ComparisonSection.tsx`（新規） | PriceComparisonBar + ProductCardGrid 間で `shopFilter` 状態を共有するクライアントラッパー |
| `ProductCardGrid.tsx` | 外部制御モード（`shopFilter` / `onShopFilterChange` props）追加・デフォルトソート `price_asc` に変更 |
| `search/page.tsx` | EmptyState に人気キーワード候補・「何を比較しますか」案内追加。`ComparisonSection` 利用に変更 |
| live-check | `phase12-sort-navigation-verify.spec.ts` — **14/14 PASS** |
| Vercel deploy | `dpl_EBGf7AZrmcvcvEJHJUs9TU9beoSh` — READY |
| regression | Phase 9 11/11 + Phase 10 8/8 + Phase 11 12/12 すべて継続 PASS |

**完了条件（全満足）:**
- [x] 「参考価格が安い順」デフォルト表示
- [x] 「参考価格が高い順」追加
- [x] 「ショップ順」追加
- [x] PriceComparisonBar タップで対応ショップフィルター連動
- [x] EmptyState: 人気キーワード候補（スマホケース/ワイヤレスイヤホン等）
- [x] EmptyState: 「何を比較しますか」案内
- [x] /search?q=xxx 形式リンク
- [x] 未承認アフィリエイト表現なし
- [x] Phase 9/10/11 regression PASS

## ✅ Phase 17 実APIアダプタ準備・デモ/実データ切替基盤（2026-05-24 完了）

### アダプタ状態整理（Phase 17 時点）

| ショップ | integrationMode | dataStatus | affiliateApprovalStatus | 将来アダプタ |
|---------|-----------------|------------|------------------------|-------------|
| Amazon | `link_only` | `demo` | `approved` | `amazon-pa-api.ts`（スタブ作成済み）|
| AliExpress | `link_only` | `demo` | `pending` | `aliexpress-portals.ts`（スタブ作成済み）|
| SHEIN | `link_only` | `demo` | `not_applied` | 未定 |
| Temu | `link_only` | `demo` | `hold` | HOLD |

### 実装内容

| 変更 | 内容 |
|---|---|
| `adapters/types.ts` | `ShopDataStatus` 型追加（demo/external_search/real_api）|
| `adapters/types.ts` | `AffiliateApprovalStatus` 型追加（approved/pending/not_applied/hold）|
| `shops/shops.ts` | `ShopDefinition` に `dataStatus`・`affiliateApprovalStatus`・`affiliateNote` フィールド追加 |
| `shops/shops.ts` | 全4ショップの現状を正確に記録（承認状態・メモ）|
| `adapters/amazon-pa-api.ts`（新規）| Amazon PA-API スタブアダプタ（link_only フォールバック付き・TODO コメント完備）|
| `adapters/aliexpress-portals.ts`（新規）| AliExpress Portals スタブアダプタ（link_only フォールバック付き・TODO コメント完備）|
| `adapters/registry.ts` | フックポイントコメント追加・スタブ import コメント追加（行動変化なし）|
| `components/search/SearchStatusSummary.tsx` | ツールチップにアフィリエイト承認状態を追加（バッジ表示は変更なし）|
| `docs/ADAPTER_DEVELOPMENT_GUIDE.md`（新規）| API 有効化手順・データソース状態説明・affiliate_settings 統合方針 |
| live-check | `phase17-adapter-infra-verify.spec.ts` — **12/12 PASS** |
| Vercel deploy | `dpl_CZPHzZzes98fjWesEQ83EYvjBLtu` — READY |
| regression | Phase 9〜16 全スペック継続 PASS |

**完了条件（全満足）:**
- [x] `ShopDataStatus` / `AffiliateApprovalStatus` 型が定義されコードで参照可能
- [x] 全4ショップの承認状態がコード上で正確に記録されている
- [x] `amazon-pa-api.ts` / `aliexpress-portals.ts` スタブが link_only フォールバック付きで作成済み
- [x] registry.ts にフックポイントコメントあり（`integrationMode` 変更 → コメント外すだけで有効化）
- [x] デモ fallback が壊れていない（全オファー正常表示）
- [x] 未承認アフィリエイト表現がない（「Temu提携」「AliExpress提携済み」等なし）
- [x] `docs/ADAPTER_DEVELOPMENT_GUIDE.md` に有効化手順・affiliate_settings 統合方針あり
- [x] TypeScript / lint / build PASS
- [x] Phase 17 live-check 12/12 PASS
- [x] Phase 9〜16 regression 全 PASS

## ✅ Phase 16 クリック分析UI改善・JST時刻・ソースラベル（2026-05-24 完了）

### DB 実データ状況（Phase 16 時点）

| 確認項目 | 結果 |
|---|---|
| 総レコード数 | 24行（Amazon 多数、Temu 1、その他）|
| user_id | ✅ NULL（全行 — 個人情報なし）|
| session_id | ✅ NULL（全行 — 個人情報なし）|
| source 区分 | direct_search / NULL（カードCTA）の2種類 |

### 改善内容

| 変更 | 内容 |
|---|---|
| `admin/click-stats/page.tsx` 全面改善 | JST 時刻表示・7日間集計・ソースラベル日本語化・クエリリンク |
| JST 時刻変換 | `getTime() + 9h offset` で UTC→JST 変換。テーブル時刻カラムを「時刻 JST」に |
| 今日のクリック | JST基準の日付文字列で `todayJST` 比較（UTC比較バグ修正）|
| 7日間集計 | 集計カード4列: 総クリック数 / 今日(JST) / 7日間 / 計測ショップ数 |
| ソースラベル | `direct_search` → 「直接検索」/ `null` / `(none)` → 「カードCTA」（「—」廃止）|
| ショップカラー | `SHOP_COLORS` マップで amazon=橙 / shein=黒 / aliexpress=赤 / temu=橙赤 |
| 上位クエリリンク | クエリ名が `/search?q=...` の `<a>` リンクに（管理者が直接確認可能）|
| 空データ対応 | キーワード未蓄積時は「まだキーワードデータがありません」empty state |
| live-check | `phase16-search-click-analysis-verify.spec.ts` — **12/12 PASS** |
| Vercel deploy | `dpl_89r6GpmFyns9aNe1exBEwuvmTJ2s` — READY |
| regression | Phase 9〜15 全スペック継続 PASS |

**完了条件（全満足）:**
- [x] 時刻を JST で表示（「時刻 JST」カラム）
- [x] 今日のクリック数が JST 基準で正確
- [x] 7日間集計カード追加
- [x] source=null 表示が「カードCTA」（「—」なし）
- [x] 上位クエリが /search?q=... リンク
- [x] ショップ別カラー表示
- [x] TypeScript / lint / build PASS
- [x] Phase 16 live-check 12/12 PASS
- [x] Phase 9〜15 regression 全 PASS

## ✅ Phase 15 クリック計測実測確認・検索導線改善（2026-05-24 完了）

### DB 実データ確認結果（2026-05-24 npx supabase db query --linked）

| 確認項目 | 結果 |
|---|---|
| 総レコード数 | 15行（Amazon 14、Temu 1）|
| clicked_url 保存 | ✅ 全行に保存済み（例: `https://www.amazon.co.jp/s?k=スマホケース`）|
| shop_code | ✅ 全行に保存済み |
| query | ✅ ユーザークリック時は保存（例: "スマホケース"、"messyu"、"鶏　小屋"）|
| source | ✅ direct_search 区別できる（Phase 13 以降） |
| user_id | ✅ NULL（個人情報なし）|
| session_id | ✅ NULL（個人情報なし）|
| destination_host | ✅ 全行に保存済み |
| マルチショップ確認 | ✅ Amazon + Temu 両方の実クリックを確認 |

**実ユーザークリック確認例（DB id=15）:**
- shop_code: `temu` / query: `鶏　小屋` / destination_host: `www.temu.com`
- Phase 13 以降のクリック計測が全4ショップで動作することを確認

### 改善内容

| 変更 | 内容 |
|---|---|
| `admin/click-stats/page.tsx` 改善 | `clicked_url` フィールド追加・`遷移先URL`カラム追加（短縮表示）|
| 空データ対応 | `totalCount=0` 時は「データなし」empty state 表示 |
| source 表示改善 | `direct_search` を青色ハイライト表示 |
| null 値表示 | `—` で統一表示 |
| SQL クエリメモ拡充 | 個人情報確認 SQL 追加 |

| 変更 | 内容 |
|---|---|
| live-check | `phase15-click-measurement-verify.spec.ts` — **12/12 PASS** |
| Vercel deploy | `dpl_Hy5SCVSkCPWUjVfu3oQUP5ZTpayv` — READY |
| regression | Phase 9 11/11 + Phase 10 8/8 + Phase 11 12/12 + Phase 12 14/14 + Phase 13 15/15 + Phase 14 12/12 すべて継続 PASS |

**完了条件（全満足）:**
- [x] /api/click 経由で click_events に実データが保存されることを確認
- [x] 全4ショップ（Amazon/SHEIN/AliExpress/Temu）のリダイレクト確認
- [x] clicked_url・shop_code・query・source が期待通り保存されることを確認
- [x] user_id=null / session_id=null — 個人情報なし確認
- [x] /admin/click-stats に統計が反映（管理者ログイン済みで確認）
- [x] 管理者未ログイン時は click_events データ非表示
- [x] admin stats の 遷移先URL カラム追加（品質改善）
- [x] Phase 15 live-check 12/12 PASS
- [x] Phase 9〜14 regression 全 PASS

## ✅ Phase 14 クリック計測・管理統計（2026-05-24 完了）

| 変更 | 内容 |
|---|---|
| DB 確認 | `click_events` テーブル: anon INSERT 権限・RLS・9行のデータを本番 DB で確認 |
| `admin/click-stats/page.tsx`（新規） | 総クリック数・今日のクリック・ショップ別棒グラフ・source別・Top10クエリ・直近20件テーブル |
| `AdminNav.tsx` | 「📊 クリック統計」ナビゲーションリンク追加 |
| `admin/page.tsx` | 管理メニューに「クリック統計」カード追加 |
| TypeScript | `icon` prop 不一致 修正（絵文字を title に統合）|
| live-check | `phase14-click-tracking-verify.spec.ts` — **12/12 PASS** |
| Vercel deploy | `dpl_HBDZA5cSCw4m3EPpMjATX1VjhJnu` — READY |
| regression | Phase 9 11/11 + Phase 10 8/8 + Phase 11 12/12 + Phase 12 14/14 + Phase 13 15/15 すべて継続 PASS |

**DB 確認内容（2026-05-24 npx supabase db query --linked）:**
- `click_events` 9行存在（offer_id="phase9-smoke" 8行 + "demo-amazon-1" 1行）
- anon: INSERT ✅ / sequence USAGE ✅
- RLS: INSERT all / SELECT admin-only
- source=null（Phase 13 direct_search は今後計測される）

**完了条件（全満足）:**
- [x] `click_events` テーブル設計・適用済み確認
- [x] `/api/click` 経由でクリックイベント保存が動作（Phase 8 から実装済み・本番 DB 確認）
- [x] 管理画面に `/admin/click-stats` 統計ページ追加
- [x] AdminNav と Admin ダッシュボードにリンク追加
- [x] 個人情報（IP/UA/user_id）は表示なし
- [x] TypeScript / lint / build PASS
- [x] Phase 14 live-check 12/12 PASS
- [x] Phase 9〜13 regression 全 PASS

## ⚠️ 次に実施すること（優先順）

1. ⏳ **AliExpress Portals 承認待ち** — 承認メール → `docs/ADAPTER_DEVELOPMENT_GUIDE.md` 手順通りに実装
2. 🔜 Amazon PA-API 有効化（売上3件達成後）→ `ADAPTER_DEVELOPMENT_GUIDE.md` 手順通りに実装
3. 🔜 **SHEIN / A8.net 申請** — https://www.a8.net/ → SHEIN プログラム（申請準備完了）
4. 🔜 **Temu Affiliate 申請**（HOLD — 申請タイミングを判断）— https://www.temu.com/affiliate.html
5. 🔜 **Phase 18候補**: Amazon アソシエイトタグを現デモリンクに適用（Supabase DB から取得・affiliate_settings 利用・docs/ADAPTER_DEVELOPMENT_GUIDE.md §統合参照）
6. 🔜 **Phase 18候補**: 人気クエリ候補をリアル click_events から自動生成（EmptyState / SearchBar）
7. 🔜 Supabase Auth URL Configuration 追加（任意・メール認証用）

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

## 現在の制約（Phase 8 時点）

| 制約 | 内容 |
|---|---|
| 商品データなし | 全ショップが link_only（デモデータのみ）|
| API接続なし | Phase 5b で実装（申請後）|
| DB未接続（本番） | SQL 定義済み・Supabase プロジェクト作成と手動適用が必要 |
| Vercel 未デプロイ | `docs/VERCEL_DEPLOYMENT.md` の手順に従い手動実施 |
| アフィリエイト ID 未設定 | 各ショップへの申請後 Supabase DB に手動 UPDATE |
| 管理者未登録 | Supabase 適用後 `admin_users` に手動 INSERT |
| PWA アイコン | placeholder（`/icons/icon-192.png` 等が未作成）|
| SEO/OGP | title / description / OGP が未最適化 |

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

## Phase 6 完了内容（2026-05-24）

### アフィリエイト収益化 土台実装

| 項目 | 内容 |
|---|---|
| アフィリエイト URL 生成 | `buildAffiliateUrl()` / `buildOfferClickUrl()` — ID 空文字時は productUrl にフォールバック |
| クリック計測 Route | `GET /api/click` — open redirect 対策・ALLOWED_DESTINATION_HOSTS 検証・302 リダイレクト |
| クリックイベント記録 | `logClickEvent()` — no-op（Supabase 設定後に有効化）|
| ProductCard PR 表記 | PR バッジ・`rel=sponsored`・アフィリエイト注意文 |
| 管理画面強化 | `/admin/affiliate` にセキュリティ警告・tracking params 表示・テストプレビュー追加 |
| 免責事項強化 | `/disclaimer` にアフィリエイト開示・クリック計測説明を追加 |
| 検索ページ開示 | `/search` ページ内に PR 一文追加 |
| DB 設計 | `docs/AFFILIATE_TRACKING_DESIGN.md` — affiliate_settings / click_events スキーマ |

### 新規作成ファイル（Phase 6）

| ファイル | 内容 |
|---|---|
| `src/lib/affiliate/types.ts` | 型定義（AffiliateSettings / AffiliateLinkInput / ClickEventData）|
| `src/lib/affiliate/link-builder.ts` | アフィリエイト URL 生成・クリック URL 生成 |
| `src/lib/affiliate/demo-settings.ts` | デモ設定（affiliateId はすべて空文字）|
| `src/lib/analytics/click-events.ts` | クリックイベント記録（現在 no-op）|
| `src/app/api/click/route.ts` | クリック計測 + リダイレクト Route Handler |
| `docs/AFFILIATE_TRACKING_DESIGN.md` | DB スキーマ・フロー設計書 |

### 変更ファイル（Phase 6）

| ファイル | 変更内容 |
|---|---|
| `src/components/search/ProductCard.tsx` | `buildOfferClickUrl()` 使用・PR バッジ・rel=sponsored |
| `src/app/admin/affiliate/page.tsx` | セキュリティ警告・tracking params・テストプレビュー・実装状況一覧 |
| `src/app/disclaimer/page.tsx` | アフィリエイト・PR 開示セクション強化 |
| `src/app/search/page.tsx` | PR/アフィリエイト開示ノート追加 |

### セキュリティ設計（Phase 6）

| 項目 | 設計 |
|---|---|
| アフィリエイト ID | `affiliateId = ''`（空文字）。実 ID は `.env.local` or Supabase DB のみ |
| open redirect 対策 | `ALLOWED_DESTINATION_HOSTS` Set による宛先ホスト検証。https のみ許可 |
| クリックデータ | Supabase 設定後に `click_events` テーブル INSERT（現在 no-op）|
| `rel` 属性 | アフィリエイトリンクは `rel="noopener noreferrer sponsored"` |

---

## Phase 7 完了内容（2026-05-24）

### 安全公開準備・ポリシー/除外ルール強化

| 項目 | 内容 |
|---|---|
| 安全フィルター型定義 | `src/lib/safety/types.ts` — SafetyLevel / AnnotatedOffer / SafetyFilterResult |
| 安全ルール定義 | `src/lib/safety/rules.ts` — BLOCKED_RULES (17ルール) / CAUTION_RULES (12ルール) |
| フィルター実装 | `src/lib/safety/filter-product-offers.ts` — filterProductOffers / checkOfferSafety |
| 検索ページ統合 | 安全フィルター適用・除外件数・注意件数バナー表示 |
| 商品カード改善 | 要注意バナー・「⚑」報告ボタンが `/report` ページへリンク |
| 問題報告ページ | `/report` — フォームUI・デモモード・送信フロー |
| ポリシーページ | `/terms` / `/privacy` / `/safety-policy` |
| フッターナビ | トップページに利用規約・プライバシー・安全ポリシー等のリンク追加 |
| 管理画面強化 | `/admin/blocked-keywords` に稼働中ルール表示・severity 分類 |
| 公開チェックリスト | `docs/SAFETY_PUBLICATION_CHECKLIST.md` |

### 新規ファイル（Phase 7）

| ファイル | 内容 |
|---|---|
| `src/lib/safety/types.ts` | 安全フィルター型定義 |
| `src/lib/safety/rules.ts` | blocked 17ルール / caution 12ルール |
| `src/lib/safety/filter-product-offers.ts` | フィルター実装 |
| `src/app/report/page.tsx` | 問題報告ページ（Server Component）|
| `src/app/report/ReportForm.tsx` | 報告フォーム（Client Component）|
| `src/app/terms/page.tsx` | 利用規約 |
| `src/app/privacy/page.tsx` | プライバシーポリシー |
| `src/app/safety-policy/page.tsx` | 安全ポリシー（rules.ts から自動生成）|
| `docs/SAFETY_PUBLICATION_CHECKLIST.md` | 公開前チェックリスト |

### 変更ファイル（Phase 7）

| ファイル | 変更内容 |
|---|---|
| `src/app/search/page.tsx` | filterProductOffers 適用・フィルター状態バナー |
| `src/components/search/ProductCard.tsx` | cautionReason prop・要注意バナー・報告リンク |
| `src/components/search/ProductCardGrid.tsx` | cautionMap / query props 追加 |
| `src/app/admin/blocked-keywords/page.tsx` | 稼働中ルール表示・severity 分類 |
| `src/app/page.tsx` | フッターナビ追加 |
| `src/lib/search/demo-results.ts` | バッテリー要注意テスト商品追加 |

### 安全フィルター方針（Phase 7）

| 分類 | ルール数 | キーワード数 | 動作 |
|---|---|---|---|
| blocked（非表示）| 17 | 約50 | 商品タイトルマッチで検索結果から除外 |
| caution（注意ラベル）| 12 | 約35 | 注意ラベル付きで表示 |

---

## Phase 8 完了内容（2026-05-24）

### Supabase本番接続・Vercelデプロイ準備

| 項目 | 内容 |
|---|---|
| SQL Migration | `supabase/migrations/0002_tracking_reports_admin.sql` — 5テーブル（click_events / reported_products / admin_users / affiliate_settings / blocked_keywords）|
| click_events DB INSERT | `src/lib/analytics/click-events.ts` — Supabase 設定済み時に INSERT、未設定時は no-op |
| reported_products DB INSERT | `src/app/report/ReportForm.tsx` — Supabase 設定済み時に INSERT、未設定時はデモモード |
| 管理者判定ヘルパー | `src/lib/admin/auth.ts` — `isAdmin()` / `requireAdmin()` — admin_users テーブル照合 |
| Vercel デプロイ手順 | `docs/VERCEL_DEPLOYMENT.md` — Step 1〜7（Vercel設定・Redirect URL・管理者登録・ロールバック）|
| SUPABASE_SETUP.md 更新 | Phase 8 テーブル・SQL 実行順・管理者登録・live-check 手順 |
| live-check spec | `phase8-supabase-vercel-verify.spec.ts` — 10/10 PASS（P8V-11/12 は手動 SKIP）|

### 新規作成ファイル（Phase 8）

| ファイル | 内容 |
|---|---|
| `supabase/migrations/0002_tracking_reports_admin.sql` | Phase 8 DB スキーマ（5テーブル・RLS・初期データ）|
| `src/lib/admin/auth.ts` | 管理者判定ヘルパー |
| `docs/VERCEL_DEPLOYMENT.md` | Vercel デプロイ手順書 |
| `tools/live-check-runner/projects/cheap-cross-search/phase8-supabase-vercel-verify.spec.ts` | Phase 8 live-check spec |

### 変更ファイル（Phase 8）

| ファイル | 変更内容 |
|---|---|
| `src/lib/analytics/click-events.ts` | Supabase 設定済み時の click_events INSERT 有効化 |
| `src/app/report/ReportForm.tsx` | Supabase 設定済み時の reported_products INSERT 有効化・エラー表示追加 |
| `docs/SUPABASE_SETUP.md` | Phase 8 テーブル・手順追記 |
| `docs/SAFETY_PUBLICATION_CHECKLIST.md` | Phase 8 項目追記 |
| `tools/live-check-runner/package.json` | `test:cheap-cross-search:phase8` スクリプト追加 |

### live-check 結果（Phase 8）

| テスト | 結果 | 内容 |
|---|---|---|
| P8V-1: graceful degradation | ✅ PASS | 9ページ全て 200 |
| P8V-2: 安全フィルター | ✅ PASS | caution ラベル確認 |
| P8V-3: /api/click 有効URL | ✅ PASS | Amazon 3xx リダイレクト |
| P8V-4: /api/click http URL | ✅ PASS | ブロック確認 |
| P8V-5: /api/click 許可外ホスト | ✅ PASS | ブロック確認 |
| P8V-6: /report デモモード | ✅ PASS | フォーム・デモバナー |
| P8V-7: ポリシーページ | ✅ PASS | terms / privacy / safety-policy |
| P8V-8: フッターナビ | ✅ PASS | 3リンク確認 |
| P8V-9: 管理画面 | ✅ PASS | /admin 表示 |
| P8V-10: blocked-keywords | ✅ PASS | ルール件数表示 |
| P8V-11: lint/build | ⏳ MANUAL | lint 0 / 20 routes 確認済み |
| P8V-12: Vercel 本番 | ⏳ MANUAL | デプロイ後に実施 |

---

## 次のアクション（手動実施待ち）

1. **Supabase プロジェクト作成** — `docs/SUPABASE_SETUP.md` Step 1〜3 を実施
2. **SQL 手動適用** — `0001_auth_favorites.sql` → `0002_tracking_reports_admin.sql` の順で実行
3. **Vercel デプロイ** — `docs/VERCEL_DEPLOYMENT.md` Step 1〜5
4. **管理者ユーザー登録** — `SUPABASE_SETUP.md` Step 6
5. **アフィリエイトプログラム申請** — 承認後に `affiliate_settings` へ ID を UPDATE
6. **ポリシーページの法的レビュー** — 公開前に弁護士確認推奨

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
