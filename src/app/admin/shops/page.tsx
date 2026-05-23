import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  AdminSectionCard,
  AdminDevPreviewBanner,
  AdminSaveUnavailableBanner,
} from '@/components/admin/AdminSectionCard';
import { getDemoShopAdminConfigs } from '@/lib/admin/demo-settings';
import type { ShopAdminConfig } from '@/lib/admin/types';

const INTEGRATION_MODE_LABELS: Record<string, string> = {
  official_api: '公式API',
  affiliate_api: 'アフィリエイトAPI',
  external_api: '外部API',
  link_only: 'リンクのみ',
  disabled: '無効',
};

const INTEGRATION_MODE_COLORS: Record<string, string> = {
  official_api: 'text-green-700 bg-green-50 border-green-200',
  affiliate_api: 'text-blue-700 bg-blue-50 border-blue-200',
  external_api: 'text-purple-700 bg-purple-50 border-purple-200',
  link_only: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  disabled: 'text-gray-500 bg-gray-50 border-gray-200',
};

const API_STATUS_LABELS: Record<ShopAdminConfig['apiStatus'], string> = {
  connected: '接続済み',
  degraded: '代替中',
  disconnected: '切断',
  not_configured: '未設定',
};

const API_STATUS_COLORS: Record<ShopAdminConfig['apiStatus'], string> = {
  connected: 'text-green-700 bg-green-50',
  degraded: 'text-yellow-700 bg-yellow-50',
  disconnected: 'text-red-700 bg-red-50',
  not_configured: 'text-gray-500 bg-gray-50',
};

const SHOP_COLORS: Record<string, string> = {
  amazon: '#FF9900',
  shein: '#000000',
  aliexpress: '#E62E04',
  temu: '#FF6533',
};

export default function AdminShopsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const shops = getDemoShopAdminConfigs();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ショップ管理</h1>
      </div>

      {!supabaseConfigured && <AdminDevPreviewBanner />}
      <AdminSaveUnavailableBanner />

      <AdminSectionCard
        title="ショップ一覧"
        description={`${shops.length} ショップ登録済み（有効: ${shops.filter((s) => s.enabled).length} / 無効: ${shops.filter((s) => !s.enabled).length}）`}
      >
        <div className="space-y-4">
          {shops.map((shop) => (
            <div
              key={shop.shopCode}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* ショップヘッダー */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: SHOP_COLORS[shop.shopCode] ?? '#888' }}
                  />
                  <span className="font-semibold text-gray-900">{shop.shopName}</span>
                  <code className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {shop.shopCode}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      shop.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {shop.enabled ? '有効' : '無効'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${
                      INTEGRATION_MODE_COLORS[shop.integrationMode] ?? ''
                    }`}
                  >
                    {INTEGRATION_MODE_LABELS[shop.integrationMode] ?? shop.integrationMode}
                  </span>
                </div>
              </div>

              {/* ショップ詳細 */}
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">表示順</span>
                    <span className="text-gray-800">{shop.displayOrder}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">API 状態</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        API_STATUS_COLORS[shop.apiStatus] ?? ''
                      }`}
                    >
                      {API_STATUS_LABELS[shop.apiStatus]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">最終成功</span>
                    <span className="text-gray-400 text-xs">{shop.lastSuccessAt ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">最終エラー</span>
                    <span className="text-gray-400 text-xs">{shop.lastErrorAt ?? '—'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-gray-500 text-xs">検索URLテンプレート</p>
                  <p className="text-xs text-gray-700 break-all font-mono bg-gray-50 rounded px-2 py-1 leading-relaxed">
                    {shop.searchUrlTemplate}
                  </p>
                  {shop.lastErrorMessage && (
                    <p className="text-xs text-red-600">{shop.lastErrorMessage}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* 設計メモ */}
      <AdminSectionCard title="今後の実装予定" description="Supabase 設定後に有効化">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>ショップ設定を DB（admin_shop_configs テーブル）に保存</li>
          <li>管理画面 UI から enabled / integrationMode を切り替え・保存</li>
          <li>検索 URLテンプレートの編集・プレビュー</li>
          <li>取得方式を <code className="text-xs bg-gray-100 px-1 rounded">link_only → affiliate_api → official_api</code> へ段階的に切り替え</li>
        </ul>
      </AdminSectionCard>
    </>
  );
}
