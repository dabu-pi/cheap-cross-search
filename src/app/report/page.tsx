/**
 * 商品問題報告ページ (Phase 7)
 *
 * 現在: フォーム UI のみ。DB 保存は Supabase 設定後に有効化予定。
 * 将来: reported_products テーブルへ INSERT → 管理画面で確認・blocked_keywords 追加
 */

import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ReportForm } from './ReportForm';

export const metadata = {
  title: '問題を報告 | 安買い横断サーチ',
};

interface ReportPageProps {
  searchParams: Promise<{
    offerId?: string;
    shopCode?: string;
    title?: string;
  }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const offerId   = params.offerId   ? decodeURIComponent(params.offerId)   : undefined;
  const shopCode  = params.shopCode  ? decodeURIComponent(params.shopCode)  : undefined;
  const titleText = params.title     ? decodeURIComponent(params.title)     : undefined;

  const supabaseConfigured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">問題を報告</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Supabase 未設定時のデモバナー */}
        {!supabaseConfigured && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-blue-700">⚠️ デモモード</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              現在、報告内容の保存は無効です。フォームは表示のみ動作します。<br />
              Supabase 設定後に <code className="bg-blue-100 px-1 rounded">reported_products</code> テーブルへの保存が有効化されます。
            </p>
          </div>
        )}

        {/* 対象商品情報 */}
        {(titleText || offerId) && (
          <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 space-y-1">
            <p className="text-xs text-gray-500 font-semibold">報告対象商品</p>
            {titleText && (
              <p className="text-sm text-gray-900 font-medium line-clamp-2">{titleText}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              {shopCode && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  ショップ: {shopCode}
                </span>
              )}
              {offerId && (
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">
                  ID: {offerId}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 報告フォーム（Client Component）*/}
        <ReportForm
          offerId={offerId}
          shopCode={shopCode}
          titleText={titleText}
          demoMode={!supabaseConfigured}
        />

        {/* ガイドライン */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-gray-700">報告ガイドライン</p>
          <ul className="text-xs text-gray-500 list-disc list-inside space-y-1 leading-relaxed">
            <li>偽物・コピー品の疑いがある場合は「偽物疑い」を選択してください</li>
            <li>危険な商品・規制対象商品は「危険商品」を選択してください</li>
            <li>価格が明らかにおかしい場合は「価格情報の誤り」を選択してください</li>
            <li>報告は匿名で行えます（ログイン不要）</li>
            <li>虚偽の報告はご遠慮ください</li>
          </ul>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← トップに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
