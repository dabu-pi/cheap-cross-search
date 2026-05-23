import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './config';

/**
 * ブラウザ用 Supabase クライアント
 * Client Component から使う
 *
 * 環境変数未設定時は null を返す。
 * 使う側は null チェックを行うこと。
 */
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
