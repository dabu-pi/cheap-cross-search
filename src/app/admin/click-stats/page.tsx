/**
 * クリック統計ページ (Phase 14 + Phase 15改善)
 *
 * /api/click 経由のクリックイベントを集計・表示する。
 * - Supabase 未設定時: 設定案内を表示
 * - 管理者未ログイン時: ログイン案内を表示
 * - 管理者ログイン済み: 統計を表示
 *
 * ⚠️ 個人情報は表示しない（user_id は表示せず、IP・UA は保存していない）。
 *
 * @see supabase/migrations/0002_tracking_reports_admin.sql (click_events テーブル定義)
 * @see src/lib/analytics/click-events.ts (INSERT ロジック)
 * @see src/app/api/click/route.ts (Route Handler)
 */

import { isSupabaseConfigured } from '@/lib/supabase/config';
import { isAdmin } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';
import { AdminSectionCard, AdminDevPreviewBanner } from '@/components/admin/AdminSectionCard';
import Link from 'next/link';

/** ショップ表示名マップ */
const SHOP_NAMES: Record<string, string> = {
  amazon: 'Amazon',
  shein: 'SHEIN',
  aliexpress: 'AliExpress',
  temu: 'Temu',
};

/** ソース表示名マップ */
const SOURCE_LABELS: Record<string, string> = {
  direct_search: '直接検索',
  '(none)': 'カードCTA',
};

interface ClickRow {
  id: number;
  shop_code: string;
  query: string | null;
  source: string | null;
  destination_host: string;
  clicked_url: string | null;
  clicked_at: string;
}

/** clicked_url からパス部分を抜き出して短縮表示 */
function shortenUrl(url: string | null): string {
  if (!url) return '—';
  try {
    const parsed = new URL(url);
    // ホスト名 + パス(最大30文字) + クエリ最初のキー
    const host = parsed.hostname.replace('www.', '').replace('ja.', '');
    const path = parsed.pathname.length > 1 ? parsed.pathname : '';
    const firstParam = parsed.searchParams.entries().next().value;
    const paramStr = firstParam ? `?${firstParam[0]}=${String(firstParam[1]).slice(0, 12)}…` : '';
    return `${host}${path.slice(0, 12)}${paramStr}`;
  } catch {
    return url.slice(0, 30) + (url.length > 30 ? '…' : '');
  }
}

export default async function ClickStatsPage() {
  // ── Supabase 未設定 ──────────────────────────────────────────
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <AdminDevPreviewBanner />
        <AdminSectionCard title="📊 クリック統計">
          <p className="text-sm text-gray-500">
            Supabase が設定されていないため、クリック統計は表示できません。
          </p>
          <p className="text-xs text-gray-400 mt-1">
            本番環境では Supabase 接続後に click_events テーブルへ自動記録されます。
          </p>
        </AdminSectionCard>
      </div>
    );
  }

  // ── 管理者未ログイン ─────────────────────────────────────────
  const adminOk = await isAdmin();
  if (!adminOk) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-700">🔒 管理者ログインが必要です</p>
          <p className="text-xs text-amber-600 mt-1">
            クリック統計を閲覧するには管理者アカウントでログインしてください。
          </p>
          <Link href="/login" className="text-xs text-blue-500 hover:underline inline-block mt-2">
            ログインページへ →
          </Link>
        </div>
      </div>
    );
  }

  // ── データ取得 ───────────────────────────────────────────────
  const supabase = await createClient();
  if (!supabase) {
    return <div className="p-4 text-sm text-gray-500">クライアント初期化エラー</div>;
  }

  // 全体件数
  const { count: totalCount = 0 } = await supabase
    .from('click_events')
    .select('*', { count: 'exact', head: true });

  // 直近 200 件（集計用）
  const { data: rows, error: rowsError } = await supabase
    .from('click_events')
    .select('id, shop_code, query, source, destination_host, clicked_url, clicked_at')
    .order('clicked_at', { ascending: false })
    .limit(200);

  if (rowsError) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">データ取得エラー</p>
          <p className="text-xs text-red-500 mt-1">{rowsError.message}</p>
        </div>
      </div>
    );
  }

  const clicks: ClickRow[] = rows ?? [];

  // ── 集計 ─────────────────────────────────────────────────────
  const byShop: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byQuery: Record<string, number> = {};
  let todayCount = 0;
  const todayStr = new Date().toISOString().slice(0, 10); // "2026-05-24"

  for (const r of clicks) {
    byShop[r.shop_code] = (byShop[r.shop_code] ?? 0) + 1;
    const src = r.source ?? '(none)';
    bySource[src] = (bySource[src] ?? 0) + 1;
    if (r.query) {
      byQuery[r.query] = (byQuery[r.query] ?? 0) + 1;
    }
    if (r.clicked_at.startsWith(todayStr)) todayCount++;
  }

  const shopRanking = Object.entries(byShop).sort((a, b) => b[1] - a[1]);
  const sourceRanking = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
  const queryRanking = Object.entries(byQuery).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const recent20 = clicks.slice(0, 20);

  const totalNum = totalCount as number;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5">

      {/* ─── ページタイトル ─── */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">📊 クリック統計</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          /api/click 経由でのショップ遷移を集計しています（個人情報非保存）
        </p>
      </div>

      {/* ─── データなし ─── */}
      {totalNum === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-semibold text-gray-500">クリックデータがまだありません</p>
          <p className="text-xs text-gray-400 mt-1">
            検索結果ページで外部ショップリンクをクリックすると自動記録されます。
          </p>
        </div>
      )}

      {/* ─── サマリカード ─── */}
      {totalNum > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalNum}</p>
              <p className="text-xs text-gray-500 mt-0.5">総クリック数</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                今日のクリック
                {todayCount === 0 && <span className="block text-gray-300 text-xs">（0件）</span>}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-2xl font-bold text-orange-500">{shopRanking.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">計測ショップ数</p>
            </div>
          </div>

          {/* ─── ショップ別 ─── */}
          <AdminSectionCard title="🏪 ショップ別クリック">
            <div className="space-y-2">
              {shopRanking.map(([code, count]) => {
                const pct = totalNum ? Math.round((count / totalNum) * 100) : 0;
                return (
                  <div key={code} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-700 w-24 shrink-0">
                      {SHOP_NAMES[code] ?? code}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-orange-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right shrink-0">
                      {count} 件 ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </AdminSectionCard>

          {/* ─── ソース別 ─── */}
          <AdminSectionCard title="🔍 クリック元（source）">
            <div className="divide-y divide-gray-50">
              {sourceRanking.map(([src, count]) => (
                <div key={src} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-gray-700">
                    {SOURCE_LABELS[src] ?? src}
                    <span className="ml-1.5 text-gray-400 font-mono text-xs">({src})</span>
                  </span>
                  <span className="text-xs font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              direct_search = 直接検索ボタン（Phase 13 以降）/ (none) = 商品カード CTA
            </p>
          </AdminSectionCard>

          {/* ─── 人気クエリ ─── */}
          {queryRanking.length > 0 && (
            <AdminSectionCard title="🔑 よく検索されたキーワード（Top 10）">
              <div className="flex flex-wrap gap-2">
                {queryRanking.map(([q, count]) => (
                  <span
                    key={q}
                    className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                  >
                    {q} <span className="font-semibold ml-1">{count}</span>
                  </span>
                ))}
              </div>
            </AdminSectionCard>
          )}

          {/* ─── 直近 20 件 ─── */}
          <AdminSectionCard title="🕐 直近のクリック（20件）">
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 pr-3 text-gray-400 font-medium">ID</th>
                    <th className="text-left py-1.5 pr-3 text-gray-400 font-medium">ショップ</th>
                    <th className="text-left py-1.5 pr-3 text-gray-400 font-medium">クエリ</th>
                    <th className="text-left py-1.5 pr-3 text-gray-400 font-medium">ソース</th>
                    <th className="text-left py-1.5 pr-3 text-gray-400 font-medium">遷移先URL</th>
                    <th className="text-left py-1.5 text-gray-400 font-medium">時刻（UTC）</th>
                  </tr>
                </thead>
                <tbody>
                  {recent20.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 pr-3 text-gray-400">{r.id}</td>
                      <td className="py-1.5 pr-3 font-semibold text-gray-700">
                        {SHOP_NAMES[r.shop_code] ?? r.shop_code}
                      </td>
                      <td className="py-1.5 pr-3 text-gray-600 max-w-[100px] truncate">
                        {r.query ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-1.5 pr-3 text-gray-500">
                        <span className={r.source === 'direct_search' ? 'text-blue-500' : 'text-gray-400'}>
                          {r.source
                            ? (SOURCE_LABELS[r.source] ?? r.source)
                            : <span className="text-gray-300">—</span>
                          }
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 text-gray-400 font-mono max-w-[150px] truncate" title={r.clicked_url ?? ''}>
                        {shortenUrl(r.clicked_url)}
                      </td>
                      <td className="py-1.5 text-gray-400 whitespace-nowrap">
                        {new Date(r.clicked_at).toISOString().replace('T', ' ').slice(0, 19)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ※ 個人情報（IP・User-Agent等）は保存・表示していません。
              user_id は集計用途のみ保持し、ここでは表示しません。
            </p>
          </AdminSectionCard>
        </>
      )}

      {/* ─── SQL確認メモ ─── */}
      <AdminSectionCard title="🗄 SQL クエリメモ">
        <p className="text-xs text-gray-500 mb-2">
          Supabase CLI / SQL Editor で直接確認する場合：
        </p>
        <pre className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`-- 総件数
SELECT COUNT(*) FROM click_events;

-- ショップ別集計
SELECT shop_code, COUNT(*) AS cnt
  FROM click_events GROUP BY shop_code ORDER BY cnt DESC;

-- source 別集計
SELECT COALESCE(source, '(none)') AS src, COUNT(*) AS cnt
  FROM click_events GROUP BY src ORDER BY cnt DESC;

-- クエリ別 Top 10（null除く）
SELECT query, COUNT(*) AS cnt
  FROM click_events WHERE query IS NOT NULL
  GROUP BY query ORDER BY cnt DESC LIMIT 10;

-- 直近20件（JST表示）
SELECT id, shop_code, query, source, destination_host,
       left(clicked_url, 60) AS url_short,
       clicked_at AT TIME ZONE 'Asia/Tokyo' AS jst
  FROM click_events ORDER BY clicked_at DESC LIMIT 20;

-- 個人情報が保存されていないことを確認
SELECT COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS has_user_id,
       COUNT(*) FILTER (WHERE session_id IS NOT NULL) AS has_session_id
  FROM click_events;`}
        </pre>
      </AdminSectionCard>

    </div>
  );
}
