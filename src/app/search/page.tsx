import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { ProductCardGrid } from '@/components/search/ProductCardGrid';
import { PriceComparisonBar } from '@/components/search/PriceComparisonBar';
import { FavoriteQueryButton } from '@/components/search/FavoriteQueryButton';
import { SearchStatusSummary } from '@/components/search/SearchStatusSummary';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { crossSearch } from '@/lib/search/engine';
import { getDemoOffers } from '@/lib/search/demo-results';
import { saveSearchQuery } from '@/lib/favorites/actions';
import { filterProductOffers } from '@/lib/safety/filter-product-offers';
import { getShopByCode } from '@/lib/shops/shops';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 shrink-0" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <SearchBar initialQuery={query} />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!query ? (
          <EmptyState />
        ) : (
          <Suspense fallback={<SearchingSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        )}
      </div>
    </main>
  );
}

/** 検索結果（Server Component） */
async function SearchResults({ query }: { query: string }) {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');

  // Phase 5: crossSearch がアダプタ registry 経由で各ショップを取得
  // ログイン中なら検索履歴を同時保存（エラーは無視）
  const [crossResult] = await Promise.all([
    crossSearch(query),
    saveSearchQuery(query, normalizedQuery).catch(() => {}),
  ]);

  // Phase 5: registry から取得したオファー（現時点は全ショップ link_only のため空）
  const apiOffers = crossResult.offers;

  // link_only ショップのリンク表示用（offers がないショップ）
  const linkOnlyShops = crossResult.shops.filter(
    (s) => s.status === 'link_only' || s.status === 'error'
  );

  // 表示するオファー: API取得 → なければキーワード対応デモデータ
  const demoOffers = getDemoOffers(query);
  const rawOffers = apiOffers.length > 0 ? apiOffers : demoOffers;

  // Phase 7: 安全フィルター適用
  const safetyResult = filterProductOffers(rawOffers);
  const displayOffers = safetyResult.annotated.map((a) => a.offer);
  const cautionAnnotations = new Map(
    safetyResult.annotated
      .filter((a) => a.safetyLevel === 'caution')
      .map((a) => [a.offer.id, a.cautionReason ?? '要注意商品です。購入前に各ショップで内容をご確認ください。'])
  );

  // デモデータを使っているか
  const usingMock = apiOffers.some((o) => o.source === 'external_api_mock');
  const usingLegacyDemo = apiOffers.length === 0;

  return (
    <>
      {/* 検索情報 + 保存ボタン */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">「{query}」</span> の比較結果
          <span className="text-gray-400 ml-1">({displayOffers.length} 件)</span>
        </p>
        <FavoriteQueryButton query={query} />
      </div>

      {/* Phase 5: ショップ別取得状態サマリ */}
      <SearchStatusSummary shops={crossResult.shops} />

      {/* Phase 11: ショップ別参考価格サマリ */}
      <PriceComparisonBar offers={displayOffers} />

      {/* 参考価格バナー（モックデータ or レガシーデモ） */}
      {(usingMock || usingLegacyDemo) && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 flex items-start gap-2">
          <span className="text-blue-400 text-sm mt-0.5 shrink-0">📊</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong className="font-semibold">参考価格を表示中</strong> —
              各ショップの価格帯イメージです。実際の価格・在庫は各ショップでご確認ください。
            </p>
            {crossResult.globalWarnings && crossResult.globalWarnings.length > 0 && (
              <details className="mt-1">
                <summary className="text-xs text-blue-400 cursor-pointer">技術情報 ▼</summary>
                <ul className="mt-1 space-y-0.5">
                  {crossResult.globalWarnings.map((w, i) => (
                    <li key={i} className="text-xs text-blue-400 pl-2">• {w}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}

      {/* 免責バナー */}
      <DisclaimerBanner />

      {/* Phase 7: 安全フィルター状態表示 */}
      {(safetyResult.blockedCount > 0 || safetyResult.cautionCount > 0) && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-semibold text-amber-700">🛡️ 安全フィルター有効</span>
          {safetyResult.blockedCount > 0 && (
            <span className="text-xs text-amber-600">{safetyResult.blockedCount} 件を非表示にしました</span>
          )}
          {safetyResult.cautionCount > 0 && (
            <span className="text-xs text-amber-600">{safetyResult.cautionCount} 件に注意ラベルを表示</span>
          )}
          <Link href="/safety-policy" className="text-xs text-amber-500 hover:underline ml-auto">フィルター方針 →</Link>
        </div>
      )}

      {/* Phase 6: PR・アフィリエイト開示ノート */}
      <p className="text-xs text-gray-400 leading-relaxed px-1">
        ※ 一部リンクは<strong className="font-medium">アフィリエイトリンク（PR）</strong>です。
        リンク経由で購入されると当サービスに報酬が発生する場合があります。
        表示価格・ランキングへの影響はありません。
        <Link href="/disclaimer" className="text-blue-400 hover:underline ml-1 inline-block">詳細 →</Link>
      </p>

      {/* ─── 商品カード比較UI（並び替え付き） ─── */}
      <ProductCardGrid offers={displayOffers} cautionMap={cautionAnnotations} query={query} />

      {/* Phase 11: コンパクト直接検索セクション */}
      {linkOnlyShops.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 space-y-2.5">
          <p className="text-xs font-semibold text-gray-500">
            🔍 各ショップで「{query}」を直接検索
          </p>
          <div className="grid grid-cols-2 gap-2">
            {linkOnlyShops.map((shopResult) => {
              const shopDef = getShopByCode(shopResult.shopCode);
              const color = shopDef?.logoColor ?? '#888';
              return (
                <a
                  key={shopResult.shopCode}
                  href={shopResult.searchUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border hover:shadow-sm transition-shadow"
                  style={{ borderLeftWidth: 3, borderLeftColor: color }}
                >
                  <span className="text-sm font-semibold" style={{ color }}>
                    {shopResult.shopName}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            上の参考価格は目安です。実際の商品・価格・在庫は各ショップでご確認ください。
          </p>
        </div>
      )}

      {/* フッター注意文 */}
      <div className="text-center py-4 space-y-1">
        <p className="text-xs text-gray-400 leading-relaxed">
          表示価格・送料・到着予定・在庫は取得時点の参考情報です。<br />
          クーポン適用後価格・実在庫は各ショップの購入画面でご確認ください。<br />
          当サイトは商品・価格の正確性を保証しません。
        </p>
        <Link href="/disclaimer" className="text-xs text-blue-400 hover:underline inline-block">
          免責事項を読む →
        </Link>
      </div>
    </>
  );
}

/** クエリなし状態 */
function EmptyState() {
  return (
    <div className="text-center py-16 space-y-3">
      <p className="text-4xl">🔍</p>
      <p className="text-gray-600 font-semibold">検索ワードを入力してください</p>
      <p className="text-sm text-gray-400">上の検索バーにキーワードを入力してEnterを押してください</p>
    </div>
  );
}

/** ローディング中スケルトン */
function SearchingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl border shadow-sm bg-white overflow-hidden animate-pulse">
          <div className="px-4 py-2.5 flex items-center gap-3">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-4 bg-gray-100 rounded-full w-20" />
          </div>
          <div className="px-4 py-3 flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 flex justify-between items-center">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded-xl w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
