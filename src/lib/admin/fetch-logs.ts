/**
 * 取得ログ / 状態デモデータ (Phase 4)
 *
 * 本番 Supabase 接続・API アダプタ実装後は fetch_logs テーブルから取得する想定。
 * 現時点では全ショップ link_only の状態を表している。
 */

import type { FetchLogEntry } from './types';

export function getDemoFetchLogs(): FetchLogEntry[] {
  return [
    {
      shopCode: 'amazon',
      shopName: 'Amazon',
      integrationMode: 'link_only',
      status: 'degraded',
      lastSuccessAt: null,
      lastErrorAt: null,
      fallbackCount: 0,
      message: 'API 未設定。link_only モードで動作中。Phase 5 で PA-API 接続予定。',
    },
    {
      shopCode: 'shein',
      shopName: 'SHEIN',
      integrationMode: 'link_only',
      status: 'degraded',
      lastSuccessAt: null,
      lastErrorAt: null,
      fallbackCount: 0,
      message: 'API 未設定。link_only モードで動作中。Phase 5 で Developer Platform 申請予定。',
    },
    {
      shopCode: 'aliexpress',
      shopName: 'AliExpress',
      integrationMode: 'link_only',
      status: 'degraded',
      lastSuccessAt: null,
      lastErrorAt: null,
      fallbackCount: 0,
      message: 'API 未設定。link_only モードで動作中。Phase 5 で Affiliate API 申請予定。',
    },
    {
      shopCode: 'temu',
      shopName: 'Temu',
      integrationMode: 'link_only',
      status: 'degraded',
      lastSuccessAt: null,
      lastErrorAt: null,
      fallbackCount: 0,
      message: 'API 未設定。link_only モードで動作中。Phase 5 で Partner Platform 申請予定。',
    },
  ];
}

/** 取得ステータスの色クラス */
export function getFetchStatusColor(status: FetchLogEntry['status']): string {
  switch (status) {
    case 'success': return 'text-green-700 bg-green-50 border-green-200';
    case 'degraded': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'error': return 'text-red-700 bg-red-50 border-red-200';
    case 'disabled': return 'text-gray-500 bg-gray-50 border-gray-200';
  }
}

/** 取得ステータスのラベル */
export function getFetchStatusLabel(status: FetchLogEntry['status']): string {
  switch (status) {
    case 'success': return '正常';
    case 'degraded': return 'link_only 代替中';
    case 'error': return 'エラー';
    case 'disabled': return '無効';
  }
}
