import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatPrice, formatShipping } from '@/lib/format/price';
import { getShopByCode } from '@/lib/shops/shops';

export const dynamic = 'force-dynamic';

export default async function FavoriteProductsPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/favorites/products');

  const supabase = await createClient();
  const { data: favorites, error } = await supabase!
    .from('favorite_products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/account" className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">お気に入り商品</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            データの取得に失敗しました: {error.message}
          </div>
        )}

        {(!favorites || favorites.length === 0) && !error && (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">♥</p>
            <p className="text-gray-600 font-semibold">お気に入り商品はまだありません</p>
            <p className="text-sm text-gray-400">商品カードの ♥ ボタンで保存できます</p>
            <Link href="/" className="inline-block text-sm text-blue-500 hover:underline mt-2">
              商品を検索する →
            </Link>
          </div>
        )}

        {favorites && favorites.map((fav) => {
          const shop = getShopByCode(fav.shop_code);
          const logoColor = shop?.logoColor ?? '#666';
          const linkUrl = fav.affiliate_url ?? fav.product_url;

          return (
            <div
              key={fav.id}
              className="bg-white rounded-2xl border shadow-sm overflow-hidden"
              style={{ borderLeft: `4px solid ${logoColor}` }}
            >
              <div className="px-4 py-3 flex gap-3 items-start">
                <div
                  className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center text-lg font-black"
                  style={{ backgroundColor: logoColor + '22', color: logoColor }}
                >
                  {fav.shop_code.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{fav.title}</p>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(fav.item_price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatShipping(fav.shipping_price)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(fav.created_at).toLocaleDateString('ja-JP')} 保存
                  </p>
                </div>
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: logoColor }}
                >
                  開く
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function NotConfigured() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border shadow-sm p-8 text-center space-y-3">
        <p className="text-3xl">⚙️</p>
        <p className="font-semibold text-gray-800">認証機能は未設定です</p>
        <Link href="/" className="inline-block text-sm text-blue-500 hover:underline">← 検索に戻る</Link>
      </div>
    </main>
  );
}
