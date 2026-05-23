# 🛒 安買い横断サーチ

Amazon・SHEIN・AliExpress・Temu を1つの検索ワードで横断検索し、価格・送料・到着予定を比較するWeb/PWAアプリ。

## 概要

- **対象ショップ:** Amazon / SHEIN / AliExpress / Temu（将来: 楽天・Yahoo等）
- **目的:** 安価系ECを1ワードで横断検索・比較
- **形態:** Web / PWA（スマホ優先）
- **収益モデル:** アフィリエイト

## 重要な設計方針

| 方針 | 内容 |
|---|---|
| 差し替え可能な取得アダプタ | `official_api` / `affiliate_api` / `external_api` / `link_only` / `disabled` を管理画面で切り替え |
| link_only fallback | API未接続のショップは検索リンクのみ表示で成立 |
| スクレイピング禁止 | ログイン突破・CAPTCHA突破・Bot回避は実装しない |
| 価格は参考情報 | 「最安」と断定しない。「取得時点の参考価格」として表示 |
| 免責必須 | 価格・送料・到着予定は各ショップで最終確認が必要 |

## 技術構成

| 技術 | 用途 |
|---|---|
| Next.js (App Router) | フロント・バックエンド |
| TypeScript | 型安全 |
| Tailwind CSS | スタイル |
| Supabase | DB / Auth |
| Vercel | ホスティング |
| PWA | スマホホーム画面追加対応 |

## ディレクトリ構造

```
src/
├── app/
│   ├── page.tsx              # トップ（検索窓）
│   ├── search/page.tsx       # 検索結果（横断比較）
│   ├── disclaimer/page.tsx   # 免責事項
│   └── layout.tsx
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx     # 検索バー
│   │   └── ShopCard.tsx      # ショップ別カード
│   └── ui/
│       └── DisclaimerBanner.tsx
└── lib/
    ├── shops/
    │   └── shops.ts          # ショップ定義・URLテンプレート
    ├── search/
    │   ├── engine.ts         # 横断検索エンジン
    │   └── adapters/
    │       ├── types.ts      # 型定義
    │       └── link-only.ts  # link_onlyアダプタ
    └── supabase/
        ├── client.ts         # ブラウザ用クライアント
        └── server.ts         # サーバー用クライアント
```

## ローカル起動

```bash
# 依存インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# .env.local を編集して Supabase URL / ANON_KEY を設定

# 開発サーバー起動
npm run dev
```

http://localhost:3000 を開く。

**注意:** Supabase 環境変数が未設定でも Phase 0-1（検索・link_only）は動作します。

## 環境変数

`.env.local.example` を参照。最低限必要なのは Supabase の設定（Phase 3 Auth から）。

## ロードマップ

詳細は [ROADMAP.md](./ROADMAP.md) を参照。

| Phase | 内容 | 状態 |
|---|---|---|
| 0 | プロジェクト土台 | ✅ 完了 |
| 1 | 検索UI + link_only横断検索 | ✅ 完了 |
| 2 | 商品カード比較UI | 🔜 次フェーズ |
| 3 | Supabase Auth + お気に入り | 🔜 |
| 4 | 管理画面 | 🔜 |
| 5 | 取得アダプタ実装（API接続） | 🔜 |
| 6 | 収益化（アフィリエイト） | 🔜 |
| 7 | 一般公開準備 | 🔜 |

## 免責

このアプリが表示する価格・送料・到着予定は取得時点の参考情報です。
実際の金額・条件は各ショップでご確認ください。
