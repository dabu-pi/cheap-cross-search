import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  AdminSectionCard,
  AdminDevPreviewBanner,
} from '@/components/admin/AdminSectionCard';
import {
  getDemoFetchLogs,
  getFetchStatusLabel,
  getFetchStatusColor,
} from '@/lib/admin/fetch-logs';

const INTEGRATION_MODE_LABELS: Record<string, string> = {
  official_api: '公式API',
  affiliate_api: 'アフィリエイトAPI',
  external_api: '外部API',
  link_only: 'リンクのみ',
  disabled: '無効',
};

const SHOP_COLORS: Record<string, string> = {
  amazon: '#FF9900',
  shein: '#000000',
  aliexpress: '#E62E04',
  temu: '#FF6533',
};

export default function AdminFetchLogsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const logs = getDemoFetchLogs();

  const successCount = logs.filter((l) => l.status === 'success').length;
  const degradedCount = logs.filter((l) => l.status === 'degraded').length;
  const errorCount = logs.filter((l) => l.status === 'error').length;
  const disabledCount = logs.filter((l) => l.status === 'disabled').length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">取得ログ・状態</h1>
      </div>

      {!supabaseConfigured && (
        <AdminDevPreviewBanner message="Supabase 未設定のため実際の取得ログは記録されていません。現在の取得方式（link_only）の状態をデモ表示しています。" />
      )}

      {/* ステータスサマリ */}
      <AdminSectionCard title="ステータスサマリ">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-green-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-700">{successCount}</p>
            <p className="text-xs text-green-600 mt-1">正常</p>
          </div>
          <div className="bg-yellow-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{degradedCount}</p>
            <p className="text-xs text-yellow-600 mt-1">link_only 代替中</p>
          </div>
          <div className="bg-red-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-red-700">{errorCount}</p>
            <p className="text-xs text-red-600 mt-1">エラー</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-gray-500">{disabledCount}</p>
            <p className="text-xs text-gray-400 mt-1">無効</p>
          </div>
        </div>
      </AdminSectionCard>

      {/* ショップ別ログ */}
      <AdminSectionCard title="ショップ別取得状態" description="Phase 5 以降で API 接続時にリアルタイム更新される予定">
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.shopCode} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* ヘッダー */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: SHOP_COLORS[log.shopCode] ?? '#888' }}
                  />
                  <span className="font-semibold text-gray-900 text-sm">{log.shopName}</span>
                  <span className="text-xs text-gray-500">
                    {INTEGRATION_MODE_LABELS[log.integrationMode] ?? log.integrationMode}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getFetchStatusColor(log.status)}`}>
                  {getFetchStatusLabel(log.status)}
                </span>
              </div>

              {/* 詳細 */}
              <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">最終成功</p>
                  <p className="text-xs text-gray-600 mt-0.5">{log.lastSuccessAt ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">最終エラー</p>
                  <p className="text-xs text-gray-600 mt-0.5">{log.lastErrorAt ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">fallback 回数</p>
                  <p className="text-xs text-gray-600 mt-0.5">{log.fallbackCount}</p>
                </div>
                <div className="sm:col-span-1">
                  <p className="text-xs text-gray-400">メッセージ</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{log.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* 実装予定 */}
      <AdminSectionCard title="今後の実装予定（Phase 5）" description="API アダプタ接続後に有効化">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>API 取得結果を fetch_logs テーブルに記録</li>
          <li>エラー時の自動 link_only fallback とログ保存</li>
          <li>ショップ別 fallback 回数・エラー率の集計</li>
          <li>しきい値超過時のアラート（メール通知等）</li>
          <li>キャッシュ TTL・古データ検出の可視化</li>
        </ul>
      </AdminSectionCard>
    </>
  );
}
