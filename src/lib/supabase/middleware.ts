import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** 認証必須パス（未ログインならログインページへリダイレクト） */
const PROTECTED_PATHS = ['/account', '/favorites', '/history'];

/**
 * Supabase セッションリフレッシュ middleware
 *
 * 役割:
 * 1. 全リクエストでセッションを更新（トークン有効期限を延長）
 * 2. PROTECTED_PATHS への未ログインアクセスを /login へリダイレクト
 *
 * Supabase 未設定時はそのまま通過（ビルド・開発を止めない）
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase 未設定時はそのまま通過
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // セッション確認（必ず getUser() を呼ぶ — getSession() は信頼できない）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証必須パスへの未ログインアクセスをリダイレクト
  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
