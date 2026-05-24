import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { AdminSectionCard, AdminDevPreviewBanner } from '@/components/admin/AdminSectionCard';
import { getDemoShopAdminConfigs } from '@/lib/admin/demo-settings';
import { getDemoFetchLogs } from '@/lib/admin/fetch-logs';
import { getFetchStatusLabel, getFetchStatusColor } from '@/lib/admin/fetch-logs';

export default function AdminDashboardPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const shops = getDemoShopAdminConfigs();
  const fetchLogs = getDemoFetchLogs();

  const enabledCount = shops.filter((s) => s.enabled).length;
  const linkOnlyCount = shops.filter((s) => s.integrationMode === 'link_only').length;
  const degradedCount = fetchLogs.filter((l) => l.status === 'degraded').length;

  const ADMIN_SECTIONS = [
    {
      href: '/admin/shops',
      icon: '🏪',
      title: 'ショップ管理',
      description: 'ショップのON/OFF・取得方式・URLテンプレート',
    },
    {
      href: '/admin/affiliate',
      icon: '💰',
      title: 'アフィリエイト設定',
      description: 'アフィリエイトID・リンクテンプレート・画像許可',
    },
    {
      href: '/admin/blocked-keywords',
      icon: '🚫',
      title: '除外キーワード',
      description: '危険・不適切キーワードの管理',
    },
    {
      href: '/admin/fetch-logs',
      icon: '📋',
      title: '取得ログ',
      description: 'ショップ別の取得状態・エラーログ',
    },
    {
      href: '/admin/click-stats',
      icon: '📊',
      title: 'クリック統計',
      description: 'ショップ遷移クリック数・クエリ分析（Supabase 必要）',
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">管理ダッシュボード</h1>
      </div>

      {!supabaseConfigured && (
        <AdminDevPreviewBanner />
      )}

      {/* KPI サマリ */}
      <AdminSectionCard title="システム状態サマリ">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{enabledCount}</p>
            <p className="text-xs text-gray-500 mt-1">有効ショップ</p>
          </div>
          <div className="bg-yellow-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{linkOnlyCount}</p>
            <p className="text-xs text-yellow-600 mt-1">link_only モード</p>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-blue-700">0</p>
            <p className="text-xs text-blue-600 mt-1">API 接続済み</p>
          </div>
          <div className="bg-orange-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{degradedCount}</p>
            <p className="text-xs text-orange-600 mt-1">代替中</p>
          </div>
        </div>
      </AdminSectionCard>

      {/* 管理セクションへのリンク */}
      <AdminSectionCard title="管理メニュー">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADMIN_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <span className="text-2xl">{section.icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">
                  {section.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </AdminSectionCard>

      {/* 取得ログ簡易表示 */}
      <AdminSectionCard title="ショップ取得状態（概要）" description="詳細は「取得ログ」から確認できます">
        <div className="space-y-2">
          {fetchLogs.map((log) => (
            <div key={log.shopCode} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-800">{log.shopName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getFetchStatusColor(log.status)}`}>
                {getFetchStatusLabel(log.status)}
              </span>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* Supabase・管理者設定ガイド */}
      {!supabaseConfigured && (
        <AdminSectionCard title="次のステップ">
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
            <li>Supabase プロジェクトを作成する → <code className="text-xs bg-gray-100 px-1 rounded">docs/SUPABASE_SETUP.md</code> 参照</li>
            <li>SQL スキーマを適用し <code className="text-xs bg-gray-100 px-1 rounded">admin_users</code> テーブルを追加する</li>
            <li>管理者ユーザーを <code className="text-xs bg-gray-100 px-1 rounded">admin_users</code> テーブルに登録する</li>
            <li>Middleware で管理者チェックを有効化する</li>
            <li>アフィリエイトIDを登録し収益化を開始する（Phase 6）</li>
          </ol>
        </AdminSectionCard>
      )}
    </>
  );
}
