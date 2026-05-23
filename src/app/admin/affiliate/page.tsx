import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  AdminSectionCard,
  AdminDevPreviewBanner,
  AdminSaveUnavailableBanner,
} from '@/components/admin/AdminSectionCard';
import { getDemoAffiliateConfigs } from '@/lib/admin/demo-settings';

const SHOP_COLORS: Record<string, string> = {
  amazon: '#FF9900',
  shein: '#000000',
  aliexpress: '#E62E04',
  temu: '#FF6533',
};

function BoolBadge({ value, trueLabel = 'OK', falseLabel = 'NG' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

export default function AdminAffiliatePage() {
  const supabaseConfigured = isSupabaseConfigured();
  const configs = getDemoAffiliateConfigs();

  const enabledCount = configs.filter((c) => c.enabled).length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">アフィリエイト設定</h1>
      </div>

      {!supabaseConfigured && <AdminDevPreviewBanner />}
      <AdminSaveUnavailableBanner />

      <AdminSectionCard
        title="アフィリエイト設定一覧"
        description={`${configs.length} ショップ（有効: ${enabledCount} / 未設定: ${configs.length - enabledCount}）`}
      >
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.shopCode} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: SHOP_COLORS[config.shopCode] ?? '#888' }}
                  />
                  <span className="font-semibold text-gray-900">{config.shopName}</span>
                </div>
                <BoolBadge value={config.enabled} trueLabel="有効" falseLabel="未設定" />
              </div>

              {/* 設定詳細 */}
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">アフィリエイトID</span>
                    <span className="text-gray-400 text-xs font-mono">
                      {config.affiliateId || '（未設定）'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">価格表示許可</span>
                    <BoolBadge value={config.priceDisplayAllowed} trueLabel="許可" falseLabel="不可" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">画像表示許可</span>
                    <BoolBadge value={config.imageDisplayAllowed} trueLabel="許可" falseLabel="不可" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">キャッシュ時間</span>
                    <span className="text-gray-700 text-xs">{config.cacheMinutes} 分</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500 text-xs">リンクテンプレート</p>
                  <p className="text-xs text-gray-700 break-all font-mono bg-gray-50 rounded px-2 py-1 leading-relaxed">
                    {config.linkTemplate}
                  </p>
                  {config.notes && (
                    <p className="text-xs text-gray-500 mt-1">{config.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* 実装予定 */}
      <AdminSectionCard title="今後の実装予定（Phase 6）" description="アフィリエイト収益化フェーズで実装">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>アフィリエイトID を DB（admin_affiliate_configs テーブル）に保存</li>
          <li>商品リンクを affiliateUrl に自動変換して表示</li>
          <li>クリックイベントを click_events テーブルに記録</li>
          <li>ショップ別コンバージョン計測の準備</li>
          <li>免責文・表示ラベルの強化</li>
        </ul>
      </AdminSectionCard>
    </>
  );
}
