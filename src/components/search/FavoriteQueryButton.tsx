'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { addFavoriteQuery } from '@/lib/favorites/actions';

interface FavoriteQueryButtonProps {
  query: string;
}

/**
 * 検索ワードをお気に入りに保存するボタン（Client Component）
 *
 * - 未ログイン: ログイン誘導
 * - ログイン済み: お気に入り保存（一度保存で「保存済み」表示）
 */
export function FavoriteQueryButton({ query }: FavoriteQueryButtonProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  if (!isSupabaseConfigured() || isLoggedIn === null) return null;

  if (isSaved) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 px-2 py-1.5">
        🔖 検索ワードを保存しました
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push(`/login?next=/search?q=${encodeURIComponent(query)}`)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
      >
        🔖 この検索を保存
      </button>
    );
  }

  async function handleSave() {
    setIsLoading(true);
    const result = await addFavoriteQuery(query);
    if (result.success) setIsSaved(true);
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 disabled:opacity-50"
    >
      🔖 {isLoading ? '保存中...' : 'この検索を保存'}
    </button>
  );
}
