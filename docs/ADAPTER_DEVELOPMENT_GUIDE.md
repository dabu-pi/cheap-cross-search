# アダプタ開発・有効化ガイド

Phase 17 作成。実 API 承認後にデモデータから実データへ切り替えるための手順書。

---

## 現在のデータソース状態 (2026-05-24 時点)

| ショップ | integrationMode | dataStatus | affiliateApprovalStatus | 次のアクション |
|---------|-----------------|------------|------------------------|---------------|
| Amazon | `link_only` | `demo` | `approved` | PA-API 有効化（売上3件後） |
| AliExpress | `link_only` | `demo` | `pending` | Portals 承認メール待ち |
| SHEIN | `link_only` | `demo` | `not_applied` | A8.net 申請（任意） |
| Temu | `link_only` | `demo` | `hold` | HOLD（申請時期未定） |

現在はすべて `link_only` → エンジンがオファーを返さない → search/page.tsx がデモデータにフォールバック。

---

## アフィリエイト設定（Supabase DB）との関係

```
.env.local / Vercel env  ← API キー・シークレット（commit 禁止）
         ↓
Supabase DB (affiliate_settings テーブル)  ← enabled/trackingParams（commit 可）
         ↓
src/lib/affiliate/link-builder.ts  ← buildAffiliateUrlFromSettings()
         ↓
ProductOffer.affiliateUrl  ← /api/click 経由でクリック計測
```

### 役割分担

| 場所 | 内容 | commit |
|------|------|--------|
| `.env.local` / Vercel env | API キー、シークレット、アソシエイトタグ | ❌ 禁止 |
| Supabase `affiliate_settings` テーブル | enabled, linkTemplate, trackingParams | 直接 DB 更新 |
| `src/lib/affiliate/demo-settings.ts` | フォールバック設定（affiliateId 空） | ✅ 可 |
| `src/lib/shops/shops.ts` | affiliateApprovalStatus, affiliateNote | ✅ 可 |

---

## Amazon PA-API 有効化手順

**前提条件:** Amazon アソシエイト承認済み・売上3件到達

### 1. API キーを取得

1. AWS コンソール: https://aws.amazon.com/
2. `IAM` → ユーザー作成 → `AmazonProduct Advertising API Full Access` ポリシーを付与
3. アクセスキーを生成

### 2. 環境変数を設定

```bash
# .env.local (commit しない)
AWS_PA_API_ACCESS_KEY=AKIA...
AWS_PA_API_SECRET_KEY=...
AMAZON_ASSOCIATE_TAG=cheapc***-22   # 実際のIDに置き換え

# Vercel Dashboard → Settings → Environment Variables に同じ値を追加
```

### 3. shops.ts を更新

```typescript
// src/lib/shops/shops.ts
{
  code: 'amazon',
  integrationMode: 'official_api',  // ← 'link_only' から変更
  dataStatus: 'real_api',           // ← 'demo' から変更
  affiliateApprovalStatus: 'approved',
  ...
}
```

### 4. registry.ts のコメントを外す

```typescript
// src/lib/search/adapters/registry.ts
case 'official_api':
  if (shopCode === 'amazon') return new AmazonPaApiAdapter();  // ← コメントを外す
  ...
```

また `import` のコメントも外す:
```typescript
import { AmazonPaApiAdapter } from './amazon-pa-api';  // ← コメントを外す
```

### 5. amazon-pa-api.ts の TODO を実装

`src/lib/search/adapters/amazon-pa-api.ts` の `search()` メソッド内の TODO 部分に
実装を追加する。PA-API v5 の SearchItems operation を使用。

### 6. デモデータ fallback の扱い

PA-API が実データを返すようになった後は:
- `search/page.tsx` の `usingLegacyDemo` が `false` になる
- 「参考価格を表示中」バナーが非表示になる（usingMock=false かつ usingLegacyDemo=false）
- 実際の商品名・価格・レビュー数が表示される

---

## AliExpress Portals 有効化手順

**前提条件:** AliExpress Portals 承認メール受信

### 1. API キーを取得

1. Portals ダッシュボード: https://portals.aliexpress.com/
2. My Account → Developer Settings → App Key / App Secret を取得

### 2. 環境変数を設定

```bash
# .env.local (commit しない)
ALIEXPRESS_PORTALS_APP_KEY=...
ALIEXPRESS_PORTALS_APP_SECRET=...

# Vercel Dashboard → Settings → Environment Variables に同じ値を追加
```

### 3. shops.ts を更新

```typescript
// src/lib/shops/shops.ts
{
  code: 'aliexpress',
  integrationMode: 'affiliate_api',  // ← 'link_only' から変更
  dataStatus: 'real_api',            // ← 'demo' から変更
  affiliateApprovalStatus: 'approved',  // ← 'pending' から変更
  ...
}
```

### 4. registry.ts のコメントを外す

```typescript
// src/lib/search/adapters/registry.ts
case 'affiliate_api':
  if (shopCode === 'aliexpress') return new AliExpressPortalsAdapter();  // ← コメントを外す
  ...
```

また `import` のコメントも外す:
```typescript
import { AliExpressPortalsAdapter } from './aliexpress-portals';  // ← コメントを外す
```

### 5. aliexpress-portals.ts の TODO を実装

`src/lib/search/adapters/aliexpress-portals.ts` の `search()` メソッド内の TODO 部分に
実装を追加する。

**重要:** Portals API の `promotion_link` はアフィリエイトリンク付き URL を返す。
`/api/click` でラップすると二重のトラッキングになる可能性があるため、
`productUrl` に直接 `promotion_link` をセットする方式を検討する。

---

## 新規ショップアダプタの追加パターン

将来 SHEIN / Temu の API が利用可能になった場合の追加手順:

```
1. src/lib/search/adapters/{shopcode}-{mode}.ts を作成
   - SearchAdapter インターフェースを実装
   - link_only フォールバックを必ず用意
   - TODO コメントで実装予定箇所を明示

2. registry.ts に import + case 追加

3. shops.ts の integrationMode / dataStatus / affiliateApprovalStatus を更新

4. live-check spec を追加

5. .env.local / Vercel env に API キーを設定（commit 禁止）
```

---

## affiliate_settings DB と検索フローの統合（将来実装）

現在はデモデータの `affiliateUrl` が `undefined` のため、`/api/click` 経由の
クリック URL は商品の `productUrl`（検索ページ URL）を遷移先としている。

Amazon アソシエイトタグを現在のデモリンクに適用する方法:

```typescript
// src/app/search/page.tsx（将来の実装イメージ）
import { createClient } from '@/lib/supabase/server';

async function SearchResults({ query }) {
  const supabase = await createClient();
  
  // affiliate_settings を DB から取得（サーバーサイドのみ・ID を表示しない）
  const { data: affiliateSettings } = await supabase
    .from('affiliate_settings')
    .select('*')
    .eq('enabled', true);
  
  // 各オファーのアフィリエイト URL を生成
  const enrichedOffers = rawOffers.map(offer => {
    const settings = affiliateSettings?.find(s => s.shop_code === offer.shopCode);
    return {
      ...offer,
      affiliateUrl: settings
        ? buildAffiliateUrlFromSettings(offer.productUrl, settings)
        : undefined,
    };
  });
  ...
}
```

**注意:** affiliateId そのものは DB に保存されているが、クライアントに送信されない。
`buildAffiliateUrlFromSettings` はサーバーサイドで実行し、生成後の URL のみをクライアントに渡す。

---

## データソース状態と UI 表示の対応

| dataStatus | 「参考価格を表示中」バナー | SearchStatusSummary | CTA テキスト |
|-----------|------------------------|---------------------|-------------|
| `demo` | 表示 | 🛒 検索対応 | ○○で検索 |
| `external_search` | 表示なし（但し linkOnly バナーあり） | 🛒 検索対応 | ○○で検索 |
| `real_api` | 表示なし | ✓ 取得済み | ○○で見る |

`dataStatus` フィールドは `shops.ts` での宣言値。
実際の UI 表示は runtime の `ShopSearchResult.status` に基づく。
`integrationMode` を切り替えることで runtime status が変わる。

---

*最終更新: Phase 17 (2026-05-24)*
