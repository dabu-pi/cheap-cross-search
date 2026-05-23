/**
 * クリックイベント計測ユーティリティ (Phase 6+)
 *
 * - Supabase 未設定時: no-op（コンソールログのみ）
 * - Supabase 設定済み時: click_events テーブルへ INSERT（Phase 8 有効化）
 * - エラーが発生しても throw せず、サイレントに失敗する（クリック動作を妨げない）
 *
 * @see docs/AFFILIATE_TRACKING_DESIGN.md
 * @see supabase/migrations/0002_tracking_reports_admin.sql
 */

import type { ClickEventData } from '@/lib/affiliate/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * クリックイベントをログ記録する。
 */
export async function logClickEvent(data: ClickEventData): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      // Supabase 未設定時は no-op
      if (process.env.NODE_ENV === 'development') {
        console.info('[click-events] (no-op: Supabase未設定)', {
          shop: data.shopCode,
          host: data.destinationHost,
          offerId: data.offerId,
          query: data.query,
        });
      }
      return;
    }

    // Supabase 設定済み時: click_events テーブルへ INSERT
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    if (!supabase) return;

    const { error } = await supabase.from('click_events').insert({
      shop_code:        data.shopCode,
      offer_id:         data.offerId         ?? null,
      query:            data.query           ?? null,
      clicked_url:      data.clickedUrl,
      destination_host: data.destinationHost,
      source:           data.source          ?? null,
      user_id:          data.userId          ?? null,
      session_id:       data.sessionId       ?? null,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[click-events] insert error:', error.message);
      }
    }
  } catch (err) {
    // クリック動作を妨げないようにエラーはサイレントに握りつぶす
    if (process.env.NODE_ENV === 'development') {
      console.warn('[click-events] unexpected error:', err);
    }
  }
}
