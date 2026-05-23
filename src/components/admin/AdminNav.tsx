'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'ダッシュボード', icon: '🏠', exact: true },
  { href: '/admin/shops', label: 'ショップ管理', icon: '🏪', exact: false },
  { href: '/admin/affiliate', label: 'アフィリエイト', icon: '💰', exact: false },
  { href: '/admin/blocked-keywords', label: '除外キーワード', icon: '🚫', exact: false },
  { href: '/admin/fetch-logs', label: '取得ログ', icon: '📋', exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gray-900 text-white">
      {/* ヘッダーバー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="font-bold text-sm tracking-wide text-gray-100">
          🛠 管理画面
        </span>
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          ← 通常画面へ
        </Link>
      </div>

      {/* ナビゲーション（横スクロール対応） */}
      <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors
              ${isActive(item.href, item.exact)
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
