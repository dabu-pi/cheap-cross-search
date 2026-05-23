/**
 * 管理者判定ユーティリティ (Phase 8)
 *
 * Supabase の admin_users テーブルで管理者かどうかを確認する。
 * Supabase 未設定時は開発環境では true（プレビュー許可）、本番では false を返す。
 *
 * @see supabase/migrations/0002_tracking_reports_admin.sql
 */

import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * 現在のユーザーが管理者かどうかを確認する。
 *
 * - Supabase 未設定 + 開発環境: true（管理画面プレビュー用）
 * - Supabase 未設定 + 本番環境: false
 * - Supabase 設定済み: admin_users テーブルの user_id を照会
 *
 * Server Components / Route Handlers から呼ぶこと（サーバーサイドのみ）。
 */
export async function isAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // 開発環境では管理画面プレビューを許可
    return process.env.NODE_ENV === 'development';
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    if (!supabase) return false;

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return false;

    // admin_users テーブルで照合
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * 管理者かどうかを確認し、非管理者なら throw する。
 * Next.js の notFound() や redirect() の代わりに使う場合は呼び出し側で処理する。
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('UNAUTHORIZED');
  }
}
