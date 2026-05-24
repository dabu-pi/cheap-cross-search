/**
 * クリック統計ページ (Phase 16改善)
 *
 * /api/click 経由のクリックイベントを集計・表示する。
 * - Supabase 未設定時: 設定案内を表示
 * - 管理者未ログイン時: ログイン案内を表示
 * - 管理者ログイン済み: 統計を表示（JST 時刻で表示）
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

// ─────────────────────────────────────────────────────────────
// 表示ヘルパー
// ─────────────────────────────────────────────────────────────

/** UTC ISO 文字列を JST "MM/DD HH:mm" に変換（Server Component 側で処理） */
function toJSTLabel(utcStr: string): string {
  try {
    const jstMs = new Date(utcStr).getTime() + 9 * 60 * 60 * 1000;
    const d = new Date(jstMs);
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const HH = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${HH}:${min}`;
  } catch {
    return utcStr.slice(0, 16);
  }
}

/** UTC ISO 文字列から JST "YYYY-MM-DD" を取得 */
function getJSTDateStr(utcStr: string): string {
  const jstMs = new Date(utcStr).getTime() + 9 * 60 * 60 * 1000;
  return new Date(jstMs).toISOString().slice(0, 10);
}

/** clicked_url を "ホスト/パス?キー=…" 形式で短縮表示 */
function shortenUrl(url: string | null): string {
  if (!url) return '—';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname
      .replace('www.', '')
      .replace('ja.', '')
      .replace('.com', '')
      .replace('.co.jp', '');
    const pathShort = parsed.pathname !== '/'
      ? parsed.pathname.slice(0, 8)
      : '';
    const firstEntry = parsed.searchParams.entries().next();
    const paramStr = firstEntry.done
      ? ''
      : `?${firstEntry.value[0]}=${String(firstEntry.value[1]).slice(0, 10)}`;
    return `${host}${pathShort}${paramStr}` || url.slice(0, 28);
  } catch {
    return url.slice(0, 28) + (url.length > 28 ? '…' : '');
  }
}

// ─────────────────────────────────────────────────────────────
// 定数
// ─────────────────────────────────────────────────────────────

/** ショップ表示名マップ */
const SHOP_NAMES: Record<string, string> = {
  amazon:     'Amazon',
  shein:      'SHEIN',
  aliexpress: 'AliExpress',
  temu:       'Temu',
};

/** ショップカラーマップ */
const SHOP_COLORS: Record<string, string> = {
  amazon:     '#FF9900',
  shein:      '#000000',
  aliexpress: '#E62E04',
  temu:       '#FF6600',
};

/** source 表示名マップ */
const SOURCE_LABELS: Record<string, string> = {
  direct_search: '直接検索',
  product_card:  'カードCTA',
  '(none)':      'カードCTA',
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

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

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

  // ── JST 基準の日付 ────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/purity
  const nowJSTMs   = Date.now() + 9 * 60 * 60 * 1000;
  const todayJST   = new Date(nowJSTMs).toISOString().slice(0, 10); // "YYYY-MM-DD"
  // eslint-disable-next-line react-hooks/purity
  const weekAgoMs  = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // ── 集計 ─────────────────────────────────────────────────────
  const byShop: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byQuery: Record<string, number> = {};
  let todayCount = 0;
  let weekCount  = 0;

  for (const r of clicks) {
    // ショップ別
    byShop[r.shop_code] = (byShop[r.shop_code] ?? 0) + 1;
    // ソース別（null → '(none)' として集計）
    const src = r.source ?? '(none)';
    bySource[src] = (bySource[src] ?? 0) + 1;
    // クエリ別（null は集計しない）
    if (r.query) {
      byQuery[r.query] = (byQuery[r.query] ?? 0) + 1;
    }
    // 今日（JST 基準）
    if (getJSTDateStr(r.clicked_at) === todayJST) todayCount++;
    // 7日間
    if (new Date(r.clicked_at).getTime() >= weekAgoMs) weekCount++;
  }

  const shopRanking  = Object.entries(byShop).sort((a, b) => b[1] - a[1]);
  const sourceRanking = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
  const queryRanking  = Object.entries(byQuery).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const recent20     = clicks.slice(0, 20);
  const totalNum     = totalCount as number;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5">

      {/* ─── ページタイトル ─── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">📊 クリック統計</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            /api/click 経由でのショップ遷移を集計（個人情報非保存 / 時刻はすべて JST）
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border">
          {new Date(nowJSTMs).toISOString().slice(0, 10)} JST
        </span>
      </div>

      {/* ─── データなし ─── */}
      {totalNum === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-semibold text-gray-500">クリックデータがまだありません</p>
          <p className="text-xs text-gray-400 mt-1">
            検索結果ページで外部ショップリンクをクリックすると自動記録されます。
          </p>
          <Link
            href="/search?q=%E3%82%B9%E3%83%9E%E3%83%9B%E3%82%B1%E3%83%BC%E3%82%B9"
            className="inline-block mt-3 text-xs text-blue-500 hover:underline"
          >
            検索ページを試す →
          </Link>
        </div>
      )}

      {/* ─── サマリカード ─── */}
      {totalNum > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalNum}</p>
              <p className="text-xs text-gray-500 mt-0.5">総クリック数</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{todayCount}</p>
              <p className="text-xs text-blue-500 mt-0.5">
                {todayCount === 0 ? '今日（0件）' : '今日'}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-indigo-700">{weekCount}</p>
              <p className="text-xs text-indigo-500 mt-0.5">7日間</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center">
              <p className="text-2xl font-bold text-orange-500">{shopRanking.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">計測ショップ数</p>
            </div>
          </div>

          {/* ─── ショップ別 ─── */}
          <AdminSectionCard title="🏪 ショップ別クリック">
            <div className="space-y-3">
              {shopRanking.map(([code, count]) => {
                const pct   = totalNum ? Math.round((count / totalNum) * 100) : 0;
                const color = SHOP_COLORS[code] ?? '#888';
                return (
                  <div key={code} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full w-24 shrink-0 text-center"
                      style={{ backgroundColor: color }}>
                      {SHOP_NAMES[code] ?? code}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-20 text-right shrink-0 font-medium">
                      {count} 件
                      <span className="text-gray-400 ml-1">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </AdminSectionCard>

          {/* ─── ソース別 ─── */}
          <AdminSectionCard title="🔍 クリック元（source）">
            <div className="divide-y divide-gray-50">
              {sourceRanking.map(([src, count]) => {
                const label = SOURCE_LABELS[src] ?? src;
                const isDirectSearch = src === 'direct_search';
                return (
                  <div key={src} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isDirectSearch
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {label}
                      </span>
                      <span className="text-xs text-gray-300 font-mono">{src}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-400">
                        {totalNum ? Math.round((count / totalNum) * 100) : 0}%
                      </div>
                      <span className="text-xs font-bold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-medium text-blue-600">direct_search</span> = 検索ページの直接検索ボタン（Phase 13〜）
                <span className="mx-1">·</span>
                <span className="font-medium text-gray-500">(none)</span> = 商品カード CTA
              </p>
            </div>
          </AdminSectionCard>

          {/* ─── 人気クエリ ─── */}
          {queryRanking.length > 0 ? (
            <AdminSectionCard title="🔑 よく検索されたキーワード（Top 10）">
              <div className="flex flex-wrap gap-2">
                {queryRanking.map(([q, count]) => (
                  <a
                    key={q}
                    href={`/search?q=${encodeURIComponent(q)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                  >
                    {q}
                    <span className="font-bold ml-1.5 text-orange-500">{count}</span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ※ クリックすると検索ページが開きます（別タブ）
              </p>
            </AdminSectionCard>
          ) : (
            <AdminSectionCard title="🔑 よく検索されたキーワード">
              <p className="text-sm text-gray-400">
                まだクエリ付きクリックがありません。
                検索結果の商品カードからクリックが記録されると表示されます。
              </p>
            </AdminSectionCard>
          )}

          {/* ─── 直近 20 件 ─── */}
          <AdminSectionCard title="🕐 直近のクリック（20件）">
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-xs border-collapse min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 pr-2 text-gray-400 font-medium w-8">ID</th>
                    <th className="text-left py-1.5 pr-2 text-gray-400 font-medium w-20">ショップ</th>
                    <th className="text-left py-1.5 pr-2 text-gray-400 font-medium">クエリ</th>
                    <th className="text-left py-1.5 pr-2 text-gray-400 font-medium w-20">経路</th>
                    <th className="text-left py-1.5 pr-2 text-gray-400 font-medium">遷移先</th>
                    <th className="text-left py-1.5 text-gray-400 font-medium w-24">時刻 JST</th>
                  </tr>
                </thead>
                <tbody>
                  {recent20.map((r) => {
                    const color = SHOP_COLORS[r.shop_code] ?? '#888';
                    const srcLabel = r.source
                      ? (SOURCE_LABELS[r.source] ?? r.source)
                      : 'カードCTA';
                    const isDirectSearch = r.source === 'direct_search';
                    return (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-1.5 pr-2 text-gray-300 text-xs">{r.id}</td>
                        <td className="py-1.5 pr-2">
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: color }}
                          >
                            {SHOP_NAMES[r.shop_code] ?? r.shop_code}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2 text-gray-600 max-w-[100px]">
                          {r.query
                            ? <span className="truncate block max-w-[96px]" title={r.query}>{r.query}</span>
                            : <span className="text-gray-300 italic text-xs">—</span>
                          }
                        </td>
                        <td className="py-1.5 pr-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isDirectSearch
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-gray-50 text-gray-500'
                          }`}>
                            {srcLabel}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2 text-gray-400 font-mono text-xs max-w-[140px] truncate"
                          title={r.clicked_url ?? ''}>
                          {shortenUrl(r.clicked_url)}
                        </td>
                        <td className="py-1.5 text-gray-400 whitespace-nowrap text-xs">
                          {toJSTLabel(r.clicked_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              ※ 個人情報（IP・User-Agent・user_id 等）は保存・表示していません。
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

-- 今日のクリック数（JST基準）
SELECT COUNT(*) FROM click_events
  WHERE clicked_at AT TIME ZONE 'Asia/Tokyo' >= CURRENT_DATE;

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
