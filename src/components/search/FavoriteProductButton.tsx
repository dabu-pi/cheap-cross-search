'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  checkIsFavoritedProduct,
  addFavoriteProduct,
  removeFavoriteProduct,
} from '@/lib/favorites/actions';
import type { ProductOffer } from '@/lib/search/adapters/types';

interface FavoriteProductButtonProps {
  offer: ProductOffer;
}

type AuthState = 'loading' | 'anonymous' | 'logged_in';

/**
 * お気に入り商品トグルボタン（Client Component）
 *
 * - Supabase 未設定: 非表示
 * - 未ログイン: 「ログイン後に保存」→ クリックで /login へ誘導
 * - ログイン済み: お気に入りトグル（楽観的 UI）
 */
export function FavoriteProductButton({ offer }: FavoriteProductButtonProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAuthState('anonymous');
        return;
      }
      setAuthState('logged_in');
      // お気に入り状態を確認
      const result = await checkIsFavoritedProduct(offer.productUrl);
      if (result === true) setIsFavorited(true);
    });
  }, [offer.productUrl]);

  // Supabase 未設定 → 非表示
  if (!isSupabaseConfigured()) return null;

  // 読み込み中
  if (authState === 'loading') {
    return (
      <button
        className="flex items-center gap-1 text-xs text-gray-200 px-2 py-1 rounded-lg cursor-not-allowed select-none"
        disabled
        aria-label="読み込み中"
      >
        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  // 未ログイン → /login へ誘導
  if (authState === 'anonymous') {
    return (
      <button
        onClick={() => router.push(`/login?next=/search`)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 px-2 py-1 rounded-lg hover:bg-pink-50 transition-colors"
        title="ログイン後に保存できます"
        aria-label="ログイン後にお気に入りに追加"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="hidden sm:inline">ログイン後に保存</span>
      </button>
    );
  }

  // ログイン済み → トグル
  async function handleToggle() {
    if (isProcessing) return;
    setIsProcessing(true);

    // 楽観的 UI: 先に状態を反転
    const prev = isFavorited;
    setIsFavorited(!prev);

    try {
      if (prev) {
        const result = await removeFavoriteProduct(offer.productUrl);
        if (!result.success) setIsFavorited(prev); // ロールバック
      } else {
        const result = await addFavoriteProduct(offer);
        if (!result.success) setIsFavorited(prev); // ロールバック
      }
    } catch {
      setIsFavorited(prev); // ロールバック
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
        isFavorited
          ? 'text-pink-500 bg-pink-50 hover:bg-pink-100'
          : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
      }`}
      aria-label={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <svg
        className="w-4 h-4"
        fill={isFavorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="hidden sm:inline">
        {isFavorited ? '保存済み' : 'お気に入り'}
      </span>
    </button>
  );
}
