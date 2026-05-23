'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * 横断検索バー
 */
export function SearchBar({
  initialQuery = '',
  placeholder = '例: ワイヤレスイヤホン、バッグ、スマホケース...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 px-4 py-3 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
        aria-label="検索キーワードを入力"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="検索"
      >
        検索
      </button>
    </form>
  );
}
