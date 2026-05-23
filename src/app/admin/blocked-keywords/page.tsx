/**
 * 除外キーワード管理ページ (Phase 7 更新)
 *
 * Phase 7 更新:
 * - 安全フィルタールール（blocked / caution）と整合させたUI
 * - severity 表示（blocked = 非表示 / caution = 注意ラベル）
 * - 実際に動作しているルール件数を safety/rules.ts から取得・表示
 */

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
import { BLOCKED_RULES, CAUTION_RULES } from '@/lib/safety/rules';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
  pharmaceutical:  'bg-blue-50 text-blue-700 border-blue-200',
  weapon:          'bg-red-50 text-red-700 border-red-200',
  counterfeit:     'bg-orange-50 text-orange-700 border-orange-200',
  adult:           'bg-pink-50 text-pink-700 border-pink-200',
  hazardous:       'bg-red-50 text-red-600 border-red-200',
  surveillance:    'bg-purple-50 text-purple-700 border-purple-200',
  gambling:        'bg-yellow-50 text-yellow-700 border-yellow-200',
  tobacco:         'bg-stone-50 text-stone-600 border-stone-200',
  illegal:         'bg-red-50 text-red-800 border-red-200',
  food_supplement: 'bg-green-50 text-green-700 border-green-200',
  baby:            'bg-sky-50 text-sky-700 border-sky-200',
  cosmetic:        'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  battery:         'bg-yellow-50 text-yellow-700 border-yellow-200',
  brand_luxury:    'bg-amber-50 text-amber-700 border-amber-200',
  other:           'bg-gray-50 text-gray-600 border-gray-200',
};

const BLOCKED_KEYWORD_CATEGORY_LABELS_EXT: Record<string, string> = {
  ...BLOCKED_KEYWORD_CATEGORY_LABELS,
  gambling:        'ギャンブル',
  tobacco:         'タバコ・ニコチン',
  illegal:         '違法品',
  food_supplement: '食品・サプリ',
  baby:            'ベビー・子ども用品',
  cosmetic:        'コスメ・スキンケア',
  battery:         '電源・バッテリー',
  brand_luxury:    'ブランド品（偽物リスク）',
};

export default function AdminBlockedKeywordsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const keywords = getDemoBlockedKeywords();

  const enabledCount = keywords.filter((k) => k.enabled).length;
  const disabledCount = keywords.length - enabledCount;

  // カテゴリ別集計（デモデータ）
  const categoryCounts = keywords.reduce<Record<string, number>>((acc, kw) => {
    acc[kw.category] = (acc[kw.category] ?? 0) + 1;
    return acc;
  }, {});

  // Phase 7 安全フィルタールールの統計
  const blockedRuleCount  = BLOCKED_RULES.length;
  const cautionRuleCount  = CAUTION_RULES.length;
  const blockedKwCount    = BLOCKED_RULES.reduce((n, r) => n + r.keywords.length, 0);
  const cautionKwCount    = CAUTION_RULES.reduce((n, r) => n + r.keywords.length, 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">除外キーワード管理</h1>
      </div>

      {!supabaseConfigured && <AdminDevPreviewBanner />}
      <AdminSaveUnavailableBanner />

      {/* ─── Phase 7 安全フィルター稼働状況 ─── */}
      <AdminSectionCard
        title="安全フィルター稼働状況（Phase 7）"
        description="src/lib/safety/rules.ts のルールがリアルタイムで商品フィルタリングに使用されている"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-center">
            <p className="text-xl font-bold text-red-700">{blockedRuleCount}</p>
            <p className="text-xs text-red-600">除外ルール（非表示）</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-center">
            <p className="text-xl font-bold text-red-600">{blockedKwCount}</p>
            <p className="text-xs text-red-500">除外キーワード数</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-center">
            <p className="text-xl font-bold text-amber-700">{cautionRuleCount}</p>
            <p className="text-xs text-amber-600">要注意ルール（警告付き）</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-center">
            <p className="text-xl font-bold text-amber-600">{cautionKwCount}</p>
            <p className="text-xs text-amber-500">要注意キーワード数</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span>ルール定義場所: <code className="bg-gray-100 px-1 rounded">src/lib/safety/rules.ts</code></span>
          <span>フィルター実装: <code className="bg-gray-100 px-1 rounded">src/lib/safety/filter-product-offers.ts</code></span>
          <Link href="/safety-policy" className="text-blue-500 hover:underline">公開安全ポリシー →</Link>
        </div>
      </AdminSectionCard>

      {/* ─── Phase 7: 稼働中 blocked ルール ─── */}
      <AdminSectionCard
        title="稼働中 除外ルール（blocked）"
        description={`${blockedRuleCount} ルール — 商品タイトルにマッチした場合は非表示`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">カテゴリ</th>
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">キーワード例</th>
                <th className="text-xs text-gray-500 font-semibold pb-2">理由</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {BLOCKED_RULES.map((rule) => (
                <tr key={rule.id}>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[rule.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {BLOCKED_KEYWORD_CATEGORY_LABELS_EXT[rule.category] ?? rule.category}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-600 font-mono">
                    {rule.keywords.slice(0, 3).join('、')}
                    {rule.keywords.length > 3 && ` 他${rule.keywords.length - 3}件`}
                  </td>
                  <td className="py-2 text-xs text-gray-500">{rule.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>

      {/* ─── Phase 7: 稼働中 caution ルール ─── */}
      <AdminSectionCard
        title="稼働中 要注意ルール（caution）"
        description={`${cautionRuleCount} ルール — 商品タイトルにマッチした場合は注意ラベル付きで表示`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">カテゴリ</th>
                <th className="text-xs text-gray-500 font-semibold pb-2 pr-4">キーワード例</th>
                <th className="text-xs text-gray-500 font-semibold pb-2">注意ラベル内容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CAUTION_RULES.map((rule) => (
                <tr key={rule.id}>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[rule.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {BLOCKED_KEYWORD_CATEGORY_LABELS_EXT[rule.category] ?? rule.category}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-gray-600 font-mono">
                    {rule.keywords.slice(0, 3).join('、')}
                    {rule.keywords.length > 3 && ` 他${rule.keywords.length - 3}件`}
                  </td>
                  <td className="py-2 text-xs text-gray-500 max-w-[200px]">{rule.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>

      {/* ─── デモデータ（旧 Phase 4 キーワードリスト）─── */}
      <AdminSectionCard
        title="デモキーワードリスト（Phase 4 定義・参考）"
        description={`${keywords.length} 件のデモデータ — Supabase 設定後は blocked_keywords テーブルで管理`}
      >
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          このリストはデモデータです。現在動作しているフィルターは上表の「稼働中ルール」を参照してください。
          Supabase 設定後は DB テーブルに統合予定。
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
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

      {/* 今後の実装予定 */}
      <AdminSectionCard title="今後の実装予定（Supabase 設定後）" description="DB接続後に有効化">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>キーワードを DB（<code className="bg-gray-100 px-1 rounded text-xs">blocked_keywords</code> テーブル）に保存・追加・削除</li>
          <li>管理画面から blocked / caution の切り替え・severity 設定</li>
          <li>通報機能との連携（<code className="bg-gray-100 px-1 rounded text-xs">reported_products</code> → 自動候補化）</li>
          <li>正規表現マッチのサニタイズと安全なテスト</li>
          <li>ルールの enable/disable 切り替え UI</li>
        </ul>
      </AdminSectionCard>
    </>
  );
}
