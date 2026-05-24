import { SearchBar } from '@/components/search/SearchBar';
import { SHOPS } from '@/lib/shops/shops';
import Link from 'next/link';

/** Phase 21: カテゴリ別人気キーワード */
const CATEGORY_QUERIES = [
  {
    label: '家電・ガジェット',
    emoji: '📱',
    queries: ['ワイヤレスイヤホン', 'スマートウォッチ', 'モバイルバッテリー', 'USBハブ'],
  },
  {
    label: 'ファッション・バッグ',
    emoji: '👜',
    queries: ['スマホケース', 'バッグ', 'リュック', '財布'],
  },
  {
    label: 'スポーツ・健康',
    emoji: '💪',
    queries: ['プロテイン', 'ヨガマット', '水筒', 'ランニングシューズ'],
  },
  {
    label: '日用品・ペット',
    emoji: '🐾',
    queries: ['ペット用品', '収納ボックス', 'タンブラー', 'エコバッグ'],
  },
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

        {/* Phase 21: カテゴリ別人気キーワード */}
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">人気カテゴリから探す</p>
          {CATEGORY_QUERIES.map((cat) => (
            <div key={cat.label} className="space-y-2">
              <p className="text-xs font-semibold text-gray-600">
                {cat.emoji} {cat.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.queries.map((q) => (
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
          ))}
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

        {/* 外部検索モード説明（Phase 21: 自然な説明を追加） */}
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500">🔍 現在の動作モード</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            現在は各ECサイトの検索結果ページへご案内する
            <strong className="font-medium text-gray-700">外部検索モード</strong>
            で動作しています。
            実際の価格・在庫・商品詳細は遷移先のショップでご確認ください。
          </p>
          <p className="text-xs text-gray-400">
            ※ Amazon アソシエイトプログラム参加中。リンク経由でご購入の場合、当サービスに報酬が発生することがあります。
          </p>
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
