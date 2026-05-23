/**
 * クリックイベント計測ユーティリティ (Phase 6)
 *
 * 現時点: Supabase 未設定のため no-op（コンソールログのみ）。
 * 将来: Supabase click_events テーブルへ insert する。
 *
 * @see docs/AFFILIATE_TRACKING_DESIGN.md
 */

import type { ClickEventData } from '@/lib/affiliate/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * クリックイベントをログ記録する。
 *
 * - Supabase 未設定時: コンソールに情報を出力するのみ（no-op）
 * - Supabase 設定済み時: click_events テーブルへ insert（TODO: Phase 6以降で実装）
 * - エラーが発生しても throw せず、サイレントに失敗する（クリック動作を妨げない）
 */
export async function logClickEvent(data: ClickEventData): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      // Supabase 未設定時は no-op（開発時のみコンソール出力）
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

    // TODO: Supabase 設定後に以下を実装
    // const supabase = await createClient();
    // if (!supabase) return;
    // const { error } = await supabase.from('click_events').insert({
    //   shop_code: data.shopCode,
    //   offer_id: data.offerId ?? null,
    //   query: data.query ?? null,
    //   clicked_url: data.clickedUrl,
    //   destination_host: data.destinationHost,
    //   source: data.source ?? null,
    //   user_id: data.userId ?? null,
    //   session_id: data.sessionId ?? null,
    // });
    // if (error) console.warn('[click-events] insert error:', error.message);

    // 現時点は Supabase 設定済みでも no-op
    if (process.env.NODE_ENV === 'development') {
      console.info('[click-events] (TODO: DB未実装)', data.shopCode, data.destinationHost);
    }
  } catch (err) {
    // クリック動作を妨げないようにエラーはサイレントに握りつぶす
    if (process.env.NODE_ENV === 'development') {
      console.warn('[click-events] unexpected error:', err);
    }
  }
}
