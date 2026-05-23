import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase OAuth コールバック
 *
 * フロー:
 * 1. Google OAuth → Supabase → このルート（code パラメータ付き）
 * 2. code を session に交換
 * 3. `next` パラメータのパスへリダイレクト
 *
 * 設定:
 * - Supabase Dashboard > Authentication > URL Configuration
 * - Site URL: https://your-domain.com
 * - Redirect URL: https://your-domain.com/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error.message);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
      }
    }
  }

  // 安全なリダイレクト先のみ許可（外部 URL へのオープンリダイレクト防止）
  const safePath = next.startsWith('/') ? next : '/';
  return NextResponse.redirect(`${origin}${safePath}`);
}
