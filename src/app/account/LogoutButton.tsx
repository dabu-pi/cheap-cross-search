'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full text-sm text-red-500 hover:text-red-700 font-medium py-1 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'ログアウト中...' : 'ログアウト'}
    </button>
  );
}
