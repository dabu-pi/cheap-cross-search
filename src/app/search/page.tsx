import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { ShopCard } from '@/components/search/ShopCard';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { crossSearch } from '@/lib/search/engine';

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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

/** 検索結果（Server Component で fetch） */
async function SearchResults({ query }: { query: string }) {
  const result = await crossSearch(query);

  return (
    <>
      {/* 検索情報 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">「{query}」</span> の検索結果
        </p>
        <p className="text-xs text-gray-400">
          {new Date(result.searchedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 時点
        </p>
      </div>

      {/* 免責 */}
      <DisclaimerBanner />

      {/* ショップカード一覧 */}
      <div className="space-y-4">
        {result.shops.map((shopResult) => (
          <ShopCard key={shopResult.shopCode} result={shopResult} query={query} />
        ))}
      </div>

      {/* フッター注意 */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          表示されている価格・送料・到着日は取得時点の参考情報です。<br />
          実際の金額・条件は各ショップの購入画面にてご確認ください。<br />
          当サイトは商品・価格の正確性を保証しません。
        </p>
        <Link href="/disclaimer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
          免責事項を読む
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
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border shadow-sm bg-white overflow-hidden animate-pulse">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="h-5 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-100 rounded w-16" />
          </div>
          <div className="px-5 py-4 bg-gray-50">
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
