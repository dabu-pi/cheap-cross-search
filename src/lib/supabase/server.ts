import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from './config';

/**
 * サーバー用 Supabase クライアント
 * Server Components / Route Handlers / Server Actions から使う
 *
 * 環境変数未設定時は null を返す。
 * 使う側は null チェックを行うこと。
 */
export async function createClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component の読み取り専用コンテキストでは無視
          }
        },
      },
    }
  );
}
