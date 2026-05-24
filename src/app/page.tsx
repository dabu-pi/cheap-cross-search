import { SearchBar } from '@/components/search/SearchBar';
import { SHOPS } from '@/lib/shops/shops';
import Link from 'next/link';

/** 人気の検索ワード例 */
const POPULAR_QUERIES = [
  'ワイヤレスイヤホン',
  'スマホケース',
  'エコバッグ',
  'タンブラー',
  'デスクライト',
  'ヨガマット',
  '収納ボックス',
  'USBハブ',
];

export default function HomePage() {
  const enabledShops = SHOPS.filter((s) => s.enabled && s.integrationMode !== 'disabled');

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">
          🛒 ECサイト比較.com
        </span>
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-xs text-blue-500 hover:text-blue-700 font-medium">
            マイページ
          </Link>
          <Link href="/disclaimer" className="text-xs text-gray-400 hover:text-gray-600">
            免責事項
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* ヒーロー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            4ショップをまとめて比較
          </h1>
          <p className="text-gray-500 text-base">
            Amazon・SHEIN・AliExpress・Temu を
            1つの検索ワードで一気に調べる
          </p>
        </div>

        {/* 検索バー */}
        <SearchBar autoFocus placeholder="例: ワイヤレスイヤホン、バッグ..." />

        {/* 人気検索 */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">人気の検索</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* 対象ショップ */}
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">対象ショップ</p>
          <div className="grid grid-cols-2 gap-3">
            {enabledShops.map((shop) => (
              <div
                key={shop.code}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm"
              >
                <div
                  className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                  style={{ backgroundColor: shop.logoColor }}
                />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{shop.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{shop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 免責短縮版 */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            価格・送料・到着予定は参考情報です。最終確認は各ショップでお願いします。
            <Link href="/disclaimer" className="ml-1 underline hover:text-gray-600">
              詳細
            </Link>
          </p>
        </div>

        {/* フッターナビ（Phase 7） */}
        <nav className="border-t border-gray-200 pt-4">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {[
              { href: '/disclaimer',   label: '免責事項' },
              { href: '/terms',        label: '利用規約' },
              { href: '/privacy',      label: 'プライバシーポリシー' },
              { href: '/safety-policy', label: '安全ポリシー' },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
