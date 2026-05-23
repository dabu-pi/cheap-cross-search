import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { RemoveFavoriteQueryButton } from './RemoveFavoriteQueryButton';

export const dynamic = 'force-dynamic';

export default async function FavoriteQueriesPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/favorites/queries');

  const supabase = await createClient();
  const { data: favorites, error } = await supabase!
    .from('favorite_queries')
    .select('id, query, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">お気に入り検索ワード</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            データの取得に失敗しました: {error.message}
          </div>
        )}

        {(!favorites || favorites.length === 0) && !error && (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🔖</p>
            <p className="text-gray-600 font-semibold">お気に入り検索ワードはまだありません</p>
            <p className="text-sm text-gray-400">検索結果ページの「この検索を保存」ボタンで保存できます</p>
            <Link href="/" className="inline-block text-sm text-blue-500 hover:underline mt-2">
              検索してみる →
            </Link>
          </div>
        )}

        {favorites && favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-white rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3"
          >
            <span className="text-gray-400 text-lg">🔍</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fav.query}</p>
              <p className="text-xs text-gray-400">
                {new Date(fav.created_at).toLocaleDateString('ja-JP')} 保存
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/search?q=${encodeURIComponent(fav.query)}`}
                className="text-xs font-medium text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                検索
              </Link>
              <RemoveFavoriteQueryButton queryId={fav.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function NotConfigured() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border shadow-sm p-8 text-center space-y-3">
        <p className="text-3xl">⚙️</p>
        <p className="font-semibold text-gray-800">認証機能は未設定です</p>
        <Link href="/" className="inline-block text-sm text-blue-500 hover:underline">← 検索に戻る</Link>
      </div>
    </main>
  );
}
