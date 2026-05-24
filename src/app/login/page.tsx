'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border shadow-sm p-8 text-center space-y-3">
          <p className="text-3xl">⚙️</p>
          <p className="font-semibold text-gray-800">認証機能は未設定です</p>
          <p className="text-sm text-gray-500">
            ログイン機能を使うには Supabase の設定が必要です。<br />
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.env.local</code> に
            Supabase の URL と ANON_KEY を設定してください。
          </p>
          <Link href="/" className="inline-block text-sm text-blue-500 hover:underline mt-2">
            ← 検索に戻る
          </Link>
        </div>
      </main>
    );
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();
    if (!supabase) return;

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: 'error', text: 'メールアドレスまたはパスワードが違います' });
      } else {
        router.push(next);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: '確認メールを送信しました。メールの「確認する」リンクをクリックしてください。',
        });
      }
    }

    setIsLoading(false);
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: 'Google ログインに失敗しました' });
      setIsLoading(false);
    }
    // 成功時は Supabase が Google OAuth ページへリダイレクト
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-4">

        {/* ヘッダー */}
        <div className="text-center space-y-1">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">
            ECサイト比較.com
          </Link>
          <p className="text-sm text-gray-500">
            {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">

          {/* Google ログイン */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google でログイン
          </button>

          {/* セパレータ */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* メール + パスワード */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs text-gray-600 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-gray-600 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="6文字以上"
              />
            </div>

            {/* メッセージ */}
            {message && (
              <p
                className={`text-xs rounded-lg px-3 py-2 ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading
                ? '処理中...'
                : mode === 'signin'
                ? 'ログイン'
                : 'アカウント作成'}
            </button>
          </form>

          {/* モード切替 */}
          <p className="text-center text-xs text-gray-400">
            {mode === 'signin' ? (
              <>
                アカウントをお持ちでない方は{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setMessage(null); }}
                  className="text-blue-500 hover:underline"
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setMessage(null); }}
                  className="text-blue-500 hover:underline"
                >
                  ログイン
                </button>
              </>
            )}
          </p>
        </div>

        {/* 検索に戻る */}
        <p className="text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline">← 検索に戻る（ログイン不要）</Link>
        </p>
      </div>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto" />
        <div className="h-10 bg-gray-100 rounded-xl" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        <div className="space-y-2">
          <div className="h-9 bg-gray-100 rounded-xl" />
          <div className="h-9 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
