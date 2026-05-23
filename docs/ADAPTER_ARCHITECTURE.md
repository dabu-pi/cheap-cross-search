# アダプタアーキテクチャ — 安買い横断サーチ (Phase 5)

最終更新: 2026-05-24

---

## 概要

検索取得方式（IntegrationMode）に応じてアダプタを差し替えられる構造を導入。
1 ショップの API 接続が失敗・未実装でも、全体検索は link_only fallback で継続できる。

```
[検索エンジン (engine.ts)]
    │
    ├─ getAdapter(shopCode, mode) ← registry.ts
    │       │
    │       ├─ official_api   → [未実装] → LinkOnlyAdapter (fallback)
    │       ├─ affiliate_api  → [未実装] → LinkOnlyAdapter (fallback)
    │       ├─ external_api   → ExternalMockAdapter (Phase 5 モック)
    │       ├─ link_only      → LinkOnlyAdapter
    │       └─ disabled       → DisabledAdapter
    │
    └─ CrossSearchResult
            │
            ├─ shops[]: ShopSearchResult[]  (ショップ別結果)
            ├─ offers[]: ProductOffer[]     (全オファー集約)
            └─ globalWarnings?: string[]    (全体警告)
```

---

## IntegrationMode

| モード | 説明 | 実装状態 |
|---|---|---|
| `official_api` | Amazon PA-API 等 公式API | ⏳ Phase 5 以降 |
| `affiliate_api` | 各社アフィリエイトAPI | ⏳ Phase 5 以降 |
| `external_api` | TKAPI 等 外部検索API（モック実装済み）| ✅ ExternalMockAdapter |
| `link_only` | 検索リンクのみ（最終 fallback）| ✅ LinkOnlyAdapter |
| `disabled` | 一時停止 | ✅ DisabledAdapter |

---

## 各アダプタ

### LinkOnlyAdapter (`adapters/link-only.ts`)

- `status: 'link_only'`
- offers は空
- searchUrl に各ショップの検索リンク URL を返す
- フォールバック先・デフォルトアダプタ

### DisabledAdapter (`adapters/disabled.ts`)

- `status: 'disabled'`
- offers は空
- ショップが `enabled: false` または `integrationMode: 'disabled'` の場合に使用

### ExternalMockAdapter (`adapters/external-mock.ts`)

- `status: 'success'`
- ショップ別のモック商品データを返す
- `source: 'external_api_mock'` で識別可能
- `warnings: ['デモデータ表示中...']` を付与
- クエリに応じたタイトルを生成（APIキー不要）
- 本格 API アダプタへの参照実装・差し替えテンプレート

---

## Registry (`adapters/registry.ts`)

```ts
getAdapter(shopCode: string, mode: IntegrationMode, fallbackWarnings?: string[]): SearchAdapter
```

- `official_api` / `affiliate_api` 未実装 → `LinkOnlyAdapter` にフォールバック（警告生成）
- `external_api` → `ExternalMockAdapter`
- `link_only` → `LinkOnlyAdapter`
- `disabled` → `DisabledAdapter`

---

## フォールバック方針

1. `getAdapter()` が安全なアダプタを返す（例外は throw しない）
2. `adapter.search()` も例外は throw せず、エラーは `ShopSearchResult` に包む
3. `Promise.allSettled()` で全ショップの並列実行 → 1 ショップの失敗が全体を止めない
4. エラー発生時は `status: 'error'` + `errorMessage` を返し、UI は ShopCard リンクを表示

---

## 現在のショップ設定（2026-05-24）

| ショップ | integrationMode | 実際のアダプタ | オファー返却 |
|---|---|---|---|
| Amazon | link_only | LinkOnlyAdapter | ❌（link_only リンクのみ）|
| SHEIN | link_only | LinkOnlyAdapter | ❌（link_only リンクのみ）|
| AliExpress | link_only | LinkOnlyAdapter | ❌（link_only リンクのみ）|
| Temu | link_only | LinkOnlyAdapter | ❌（link_only リンクのみ）|

現時点では全ショップが `link_only` のため、`/search` ページはレガシーデモデータを表示。
商品カード UI の確認は引き続き `getDemoOffers()` のデモデータで行う。

---

## 管理画面との連携方針

### 現在（Phase 4-5）
- `shops.ts` の静的設定から `integrationMode` を読み込む
- 管理画面 `/admin/shops` は設定を表示するのみ（保存不可）

### 将来（Supabase 設定後）
- Supabase `shop_integrations` テーブルに設定を保存
- `engine.ts` が DB から `integrationMode` を動的取得
- 管理画面で変更した取得方式が即座に検索エンジンに反映される
- `shops.ts` は Supabase 未設定時のフォールバック設定として残す

---

## 本格 API アダプタの追加手順

1. `src/lib/search/adapters/{shopCode}-{mode}.ts` を新規作成
   - `SearchAdapter` インターフェースを実装
   - `mode` フィールドに対応する `IntegrationMode` を設定
   - エラーは throw せず `ShopSearchResult` に包む

2. `registry.ts` の `getAdapter()` に新ケースを追加:
   ```ts
   case 'official_api':
     if (shopCode === 'amazon') return new AmazonPaApiAdapter(shopCode);
     // ...
   ```

3. `shops.ts` または 管理画面 DB で対象ショップの `integrationMode` を更新

4. `ExternalMockAdapter` は不要になったショップ分を削除またはコメントアウト

---

## 優先 API 調査候補（Phase 5 以降）

| ショップ | 候補 API | 申請方法 |
|---|---|---|
| AliExpress | AliExpress Affiliate API / TKAPI | 申請が比較的オープン |
| Amazon | PA-API 5.0 | アソシエイト審査が必要 |
| SHEIN | Developer Platform | 審査制 |
| Temu | Partner Platform | 招待制 |
