/**
 * クリック計測 + リダイレクト Route Handler (Phase 6)
 *
 * GET /api/click?shop={shopCode}&to={destinationUrl}[&offerId={id}][&q={query}]
 *
 * ─── セキュリティ (open redirect 対策) ──────────────────────────────────
 * `to` パラメータは必ず以下のいずれかのホストで始まることを検証する。
 * 検証に失敗した場合は / へリダイレクト（404 ではなく安全な場所へ）。
 * 許可リストに含まれないホストへは絶対に redirect しない。
 *
 * ─── クリックログ ──────────────────────────────────────────────────────
 * Supabase 未設定時: no-op（コンソールのみ）
 * Supabase 設定後: click_events テーブルへ insert
 *
 * @see src/lib/analytics/click-events.ts
 * @see docs/AFFILIATE_TRACKING_DESIGN.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { logClickEvent } from '@/lib/analytics/click-events';

// ─────────────────────────────────────────────────────────────
// 許可するリダイレクト先ホスト（open redirect 対策）
// ─────────────────────────────────────────────────────────────
const ALLOWED_DESTINATION_HOSTS = new Set([
  // Amazon Japan
  'www.amazon.co.jp',
  'amazon.co.jp',
  // SHEIN Japan
  'jp.shein.com',
  'www.shein.com',
  // AliExpress
  'ja.aliexpress.com',
  'aliexpress.com',
  's.click.aliexpress.com',
  // Temu
  'www.temu.com',
  'temu.com',
]);

/** fallback リダイレクト先（不正 URL の場合） */
const FALLBACK_URL = '/';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const toParam = searchParams.get('to');
  const shopCode = searchParams.get('shop') ?? '';
  const offerId = searchParams.get('offerId') ?? undefined;
  const query = searchParams.get('q') ?? undefined;

  // ── to パラメータの検証 ──────────────────────────────────────
  if (!toParam) {
    return NextResponse.redirect(new URL(FALLBACK_URL, request.url));
  }

  let destinationUrl: URL;
  try {
    destinationUrl = new URL(decodeURIComponent(toParam));
  } catch {
    // URL としてパースできない → フォールバック
    return NextResponse.redirect(new URL(FALLBACK_URL, request.url));
  }

  // https のみ許可（http は不可）
  if (destinationUrl.protocol !== 'https:') {
    return NextResponse.redirect(new URL(FALLBACK_URL, request.url));
  }

  // ホスト検証
  if (!ALLOWED_DESTINATION_HOSTS.has(destinationUrl.hostname)) {
    // 許可されていないホスト → フォールバック
    if (process.env.NODE_ENV === 'development') {
      console.warn('[click-route] blocked destination:', destinationUrl.hostname);
    }
    return NextResponse.redirect(new URL(FALLBACK_URL, request.url));
  }

  // ── クリックイベントをログ記録（非同期・失敗しても続行）─────────
  await logClickEvent({
    shopCode,
    offerId,
    query,
    clickedUrl: destinationUrl.toString(),
    destinationHost: destinationUrl.hostname,
    source: searchParams.get('source') ?? undefined,
  }).catch(() => {
    // ログ失敗してもリダイレクトは続行
  });

  // ── 許可済みの外部 URL へリダイレクト ────────────────────────
  return NextResponse.redirect(destinationUrl.toString(), {
    status: 302,
    headers: {
      // キャッシュさせない（クリックごとに計測するため）
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
