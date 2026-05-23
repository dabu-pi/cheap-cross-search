import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/history');

  const supabase = await createClient();
  const { data: history, error } = await supabase!
    .from('search_queries')
    .select('id, query, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">検索履歴</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            データの取得に失敗しました: {error.message}
          </div>
        )}

        {(!history || history.length === 0) && !error && (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🕐</p>
            <p className="text-gray-600 font-semibold">検索履歴はまだありません</p>
            <p className="text-sm text-gray-400">ログイン状態で検索すると自動的に記録されます</p>
            <Link href="/" className="inline-block text-sm text-blue-500 hover:underline mt-2">
              検索してみる →
            </Link>
          </div>
        )}

        {history && history.map((item) => (
          <Link
            key={item.id}
            href={`/search?q=${encodeURIComponent(item.query)}`}
            className="flex items-center gap-3 bg-white rounded-xl border px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-300 text-sm">🕐</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{item.query}</p>
            </div>
            <p className="text-xs text-gray-400 shrink-0">
              {new Date(item.created_at).toLocaleDateString('ja-JP')}
            </p>
          </Link>
        ))}

        {history && history.length >= 100 && (
          <p className="text-center text-xs text-gray-400 py-2">
            最新 100 件を表示しています
          </p>
        )}
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
