import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LogoutButton } from './LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border shadow-sm p-8 text-center space-y-3">
          <p className="text-3xl">⚙️</p>
          <p className="font-semibold text-gray-800">認証機能は未設定です</p>
          <p className="text-sm text-gray-500">
            Supabase の URL と ANON_KEY を設定してください。
          </p>
          <Link href="/" className="inline-block text-sm text-blue-500 hover:underline">
            ← 検索に戻る
          </Link>
        </div>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-blue-600">
            安買い横断サーチ
          </Link>
          <span className="text-sm text-gray-500">マイページ</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ユーザー情報 */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-400">
                登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>

        {/* メニュー */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <AccountMenuItem
            href="/favorites/products"
            icon="♥"
            label="お気に入り商品"
            description="保存した商品を確認"
          />
          <AccountMenuItem
            href="/favorites/queries"
            icon="🔖"
            label="お気に入り検索ワード"
            description="保存した検索ワードを確認"
          />
          <AccountMenuItem
            href="/history"
            icon="🕐"
            label="検索履歴"
            description="過去の検索ワードを確認"
          />
        </div>

        {/* ログアウト */}
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <LogoutButton />
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline">← 検索に戻る</Link>
        </p>
      </div>
    </main>
  );
}

function AccountMenuItem({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <span className="text-xl w-7 text-center">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
