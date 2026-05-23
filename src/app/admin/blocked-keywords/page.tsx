import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  AdminSectionCard,
  AdminDevPreviewBanner,
  AdminSaveUnavailableBanner,
} from '@/components/admin/AdminSectionCard';
import {
  getDemoBlockedKeywords,
  BLOCKED_KEYWORD_CATEGORY_LABELS,
  BLOCKED_KEYWORD_MATCH_TYPE_LABELS,
} from '@/lib/admin/blocked-keywords';

const CATEGORY_COLORS: Record<string, string> = {
  pharmaceutical: 'bg-blue-50 text-blue-700 border-blue-200',
  weapon: 'bg-red-50 text-red-700 border-red-200',
  counterfeit: 'bg-orange-50 text-orange-700 border-orange-200',
  adult: 'bg-pink-50 text-pink-700 border-pink-200',
  hazardous: 'bg-red-50 text-red-600 border-red-200',
  surveillance: 'bg-purple-50 text-purple-700 border-purple-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function AdminBlockedKeywordsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const keywords = getDemoBlockedKeywords();

  const enabledCount = keywords.filter((k) => k.enabled).length;
  const disabledCount = keywords.length - enabledCount;

  // カテゴリ別に集計
  const categoryCounts = keywords.reduce<Record<string, number>>((acc, kw) => {
    acc[kw.category] = (acc[kw.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">除外キーワード管理</h1>
      </div>

      {!supabaseConfigured && <AdminDevPreviewBanner />}
      <AdminSaveUnavailableBanner />

      {/* サマリ */}
      <AdminSectionCard title="集計">
        <div className="flex flex-wrap gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-center min-w-[80px]">
            <p className="text-xl font-bold text-gray-900">{keywords.length}</p>
            <p className="text-xs text-gray-500">合計</p>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2 text-center min-w-[80px]">
            <p className="text-xl font-bold text-green-700">{enabledCount}</p>
            <p className="text-xs text-green-600">有効</p>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-2 text-center min-w-[80px]">
            <p className="text-xl font-bold text-gray-500">{disabledCount}</p>
            <p className="text-xs text-gray-400">無効</p>
          </div>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className={`rounded-lg px-4 py-2 text-center min-w-[80px] border ${CATEGORY_COLORS[cat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs">{BLOCKED_KEYWORD_CATEGORY_LABELS[cat] ?? cat}</p>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* キーワード一覧 */}
      <AdminSectionCard
        title="キーワード一覧"
        description="デモデータ。Supabase 設定後は blocked_keywords テーブルで管理する予定。"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">キーワード</th>
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">照合</th>
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">カテゴリ</th>
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">理由</th>
                <th className="text-xs text-gray-500 font-semibold pb-2">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keywords.map((kw) => (
                <tr key={kw.id} className={kw.enabled ? '' : 'opacity-40'}>
                  <td className="py-2 pr-4">
                    <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {kw.keyword}
                    </code>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-600">
                    {BLOCKED_KEYWORD_MATCH_TYPE_LABELS[kw.matchType] ?? kw.matchType}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[kw.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {BLOCKED_KEYWORD_CATEGORY_LABELS[kw.category] ?? kw.category}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-500 max-w-[200px]">{kw.reason}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kw.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {kw.enabled ? '有効' : '無効'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>

      {/* 実装予定 */}
      <AdminSectionCard title="今後の実装予定" description="DB接続後に有効化">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>キーワードを DB（blocked_keywords テーブル）に保存・追加・削除</li>
          <li>検索クエリと商品タイトルへの除外フィルター適用</li>
          <li>正規表現マッチのサニタイズと安全なテスト</li>
          <li>通報機能との連携（reported_products → 自動候補化）</li>
        </ul>
      </AdminSectionCard>
    </>
  );
}
