# ROADMAP — 安買い横断サーチ

## フェーズ概要

| Phase | タイトル | 状態 | 優先 |
|---|---|---|---|
| 0 | プロジェクト土台 | ✅ 完了 | - |
| 1 | 検索UI + link_only横断検索 | ✅ 完了 | - |
| 2 | 商品カード比較UI | 🔜 未着手 | ★★★ |
| 3 | Supabase Auth + お気に入り | 🔜 未着手 | ★★☆ |
| 4 | 管理画面 | 🔜 未着手 | ★★☆ |
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

## Phase 2: 商品カード比較UI 🔜

**完了条件:** ダミーまたは仮データで比較UIが成立・商品あり/なし両方の表示が崩れない

- [ ] 商品カードコンポーネント（ProductCard.tsx）
  - 商品画像・商品名・本体価格・送料・合計見込み価格
  - 到着予定・評価・レビュー数（取得できる場合のみ）
  - 価格取得時刻（小さく）
  - 価格信頼度（high/medium/low/unknown）
  - ショップリンク
- [ ] おすすめ順 / 安い順 / 評価順 切替
- [ ] おすすめスコア計算ロジック
- [ ] ダミーデータ生成ユーティリティ（開発・テスト用）
- [ ] 「不明」項目の表示崩れ防止

---

## Phase 3: Supabase Auth + お気に入り 🔜

**完了条件:** 未ログインでも検索可能・ログイン時のみ保存系機能が使える

- [ ] Supabase テーブル作成
  - users / search_queries / favorite_products / favorite_queries
- [ ] メールログイン
- [ ] Googleログイン
- [ ] お気に入り商品（ログイン時）
- [ ] お気に入り検索ワード（ログイン時）
- [ ] 検索履歴（ログイン時）
- [ ] ログアウト
- [ ] Claude検証用管理者アカウント（live-check-runner用）

---

## Phase 4: 管理画面 🔜

**完了条件:** 管理画面からショップ設定・除外キーワードを変更できる

- [ ] 管理者権限チェック（admin_users テーブル）
- [ ] ショップ管理（/admin/shops）
  - ON/OFF / 取得方式切替 / 表示順
- [ ] アフィリエイト設定（/admin/affiliate）
- [ ] 除外キーワード管理（/admin/blocked-keywords）
- [ ] 除外カテゴリ管理（/admin/blocked-categories）
- [ ] 取得ログ確認（/admin/fetch-logs）
- [ ] 通報管理（/admin/reports）

---

## Phase 5: 取得アダプタ実装 🔜

**完了条件:** 少なくとも1ショップで商品一覧取得・他ショップはfallbackで成立

優先順:
1. AliExpress Affiliate API / 外部API（TKAPI等）
2. Amazon Creators API / PA-API代替調査
3. SHEIN Developer Platform
4. Temu Partner Platform

各ショップ:
- [ ] API調査・申請（外部作業）
- [ ] アダプタ実装
- [ ] キャッシュ実装（search_results_cache）
- [ ] 取得失敗時のfallback
- [ ] 取得ログ保存

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
