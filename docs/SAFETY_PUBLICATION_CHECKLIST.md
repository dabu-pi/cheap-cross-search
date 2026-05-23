# 一般公開前チェックリスト — 安買い横断サーチ

Phase 7 で整備した安全対策・ポリシーの公開前確認リスト。
「✅ 済」: Phase 7 時点で実装完了 / 「⏳ 要実施」: 公開前に手動または追加実装が必要

---

## 安全フィルター

| 項目 | 状態 | 備考 |
|---|---|---|
| `blocked` ルール実装 | ✅ 済 | `src/lib/safety/rules.ts` (BLOCKED_RULES) |
| `caution` ルール実装 | ✅ 済 | `src/lib/safety/rules.ts` (CAUTION_RULES) |
| `filterProductOffers()` 実装 | ✅ 済 | `src/lib/safety/filter-product-offers.ts` |
| 検索ページへのフィルター適用 | ✅ 済 | `src/app/search/page.tsx` |
| 除外件数・注意件数の表示 | ✅ 済 | 検索ページのフィルター状態バナー |
| フィルターの定期レビュー | ⏳ 要実施 | 公開後定期的にルールを見直す |
| Supabase `blocked_keywords` テーブルへの移行 | ⏳ 要実施 | 管理画面から動的更新できるようにする |

---

## 通報導線

| 項目 | 状態 | 備考 |
|---|---|---|
| ProductCard の「⚑」報告ボタン | ✅ 済 | `/report?offerId=...` へリンク |
| `/report` ページ（フォーム UI）| ✅ 済 | フォーム表示 + デモモード |
| フォーム送信（デモモード）| ✅ 済 | 疑似送信で UI 確認可能 |
| `reported_products` テーブルへの DB 保存 | ⏳ 要実施 | Supabase 設定後に実装 |
| 管理画面での通報確認 UI | ⏳ 要実施 | `/admin/reports` ページ追加（Phase 8 以降）|

---

## ポリシーページ

| ページ | 状態 | 備考 |
|---|---|---|
| `/terms` 利用規約 | ✅ 済 | 初版ドラフト（法的レビュー未実施）|
| `/privacy` プライバシーポリシー | ✅ 済 | 初版ドラフト（法的レビュー未実施）|
| `/safety-policy` 安全ポリシー | ✅ 済 | safety/rules.ts からルール自動生成 |
| `/disclaimer` 免責事項 | ✅ 済 | Phase 6 で強化済み |
| **法的レビュー** | ⏳ 要実施 | 実際の公開前に弁護士・法的確認を推奨 |
| プライバシーポリシーの最終確認 | ⏳ 要実施 | 個人情報保護法・GDPR・APPIへの準拠確認 |

---

## フッター・ナビゲーション

| 項目 | 状態 | 備考 |
|---|---|---|
| トップページ フッターナビ | ✅ 済 | 免責・利用規約・プライバシー・安全ポリシー |
| 検索ページ フッター免責リンク | ✅ 済 | `/disclaimer` へのリンク |
| 商品カード PR/アフィリエイト注記 | ✅ 済 | Phase 6 実装済み |

---

## 技術的安全対策

| 項目 | 状態 | 備考 |
|---|---|---|
| open redirect 対策 | ✅ 済 | `/api/click` ALLOWED_DESTINATION_HOSTS 検証 |
| https のみ許可 | ✅ 済 | `/api/click` protocol 検証 |
| `rel="noopener noreferrer sponsored"` | ✅ 済 | Phase 6 実装済み |
| Supabase RLS | ⏳ 要実施 | SQL 適用後に有効化 |
| 管理者権限チェック | ⏳ 要実施 | `admin_users` テーブル作成後に実装 |
| Rate Limiting | ⏳ 要実施 | Vercel/Edge middleware で実装 |
| 画像 URL の外部ドメイン制限 | ⏳ 要実施 | next.config の `images.remotePatterns` 設定 |

---

## アフィリエイト・収益化

| 項目 | 状態 | 備考 |
|---|---|---|
| PR バッジ表示 | ✅ 済 | Phase 6 実装済み |
| アフィリエイトリンク生成基盤 | ✅ 済 | Phase 6 実装済み |
| 免責ページのアフィリエイト開示 | ✅ 済 | Phase 6 実装済み |
| 各プログラムへの申請 | ⏳ 要実施 | Amazon / SHEIN / AliExpress / Temu |
| `affiliate_settings` テーブルに実 ID 投入 | ⏳ 要実施 | 申請審査通過後 |
| click_events DB INSERT 有効化 | ⏳ 要実施 | Supabase 設定後 |

---

## SEO・PWA

| 項目 | 状態 | 備考 |
|---|---|---|
| ページタイトル・description | ⏳ 要実施 | 各ページに `metadata` 追加 |
| OGP (Open Graph) | ⏳ 要実施 | SNS シェア用 |
| PWA アイコン | ⏳ 要実施 | icon-192.png / icon-512.png 作成 |
| sitemap.xml | ⏳ 要実施 | Next.js App Router の `sitemap.ts` |
| robots.txt | ⏳ 要実施 | `/app/robots.ts` で定義 |

---

## 本番インフラ

| 項目 | 状態 | 備考 |
|---|---|---|
| Supabase プロジェクト作成 | ⏳ 要実施 | `docs/SUPABASE_SETUP.md` 手順に従う |
| `.env.local` 設定 | ⏳ 要実施 | URL / anon_key / 必要に応じてサービスロールキー |
| SQL マイグレーション適用 | ⏳ 要実施 | `supabase/migrations/0001_auth_favorites.sql` |
| `affiliate_settings` / `click_events` テーブル作成 | ⏳ 要実施 | `docs/AFFILIATE_TRACKING_DESIGN.md` の SQL を実行 |
| Vercel デプロイ | ⏳ 要実施 | GitHub 連携 / 環境変数設定 |
| カスタムドメイン設定 | ⏳ 要実施 | Vercel ドメイン設定 |
| Google Search Console 登録 | ⏳ 要実施 | インデックス登録 |

---

## 公開直前の最終確認

```powershell
# lint / build
cd C:\hirayama-ai-workspace\workspace\cheap-cross-search
npm run lint
npm run build

# live-check-runner（全フェーズ）
cd C:\hirayama-ai-workspace\workspace\tools\live-check-runner
npm run test:cheap-cross-search:phase3
npm run test:cheap-cross-search:phase4
npm run test:cheap-cross-search:phase5
npm run test:cheap-cross-search:phase6
npm run test:cheap-cross-search:phase7
```

---

*作成: Phase 7 (2026-05-24)*  
*関連: `docs/SUPABASE_SETUP.md` / `docs/AFFILIATE_TRACKING_DESIGN.md` / `docs/ADAPTER_ARCHITECTURE.md`*
