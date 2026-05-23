'use client';

import { useState } from 'react';
import { removeFavoriteQuery } from '@/lib/favorites/actions';
import { useRouter } from 'next/navigation';

export function RemoveFavoriteQueryButton({ queryId }: { queryId: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    if (!confirm('このお気に入り検索ワードを削除しますか？')) return;
    setIsLoading(true);
    await removeFavoriteQuery(queryId);
    router.refresh();
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isLoading}
      className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 px-2 py-1.5"
      aria-label="削除"
    >
      {isLoading ? '...' : '削除'}
    </button>
  );
}
