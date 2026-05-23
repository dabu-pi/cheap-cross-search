import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * サーバーサイドでログイン中ユーザーを取得
 *
 * @returns User | null（未ログイン or Supabase 未設定）
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
}
