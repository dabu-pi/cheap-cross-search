/**
 * Supabase 設定チェック
 *
 * 環境変数未設定時にビルド / レンダリングが壊れないよう、
 * Supabase を使う前に必ずこの関数でチェックすること。
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
