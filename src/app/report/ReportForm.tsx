'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/** 報告理由 */
const REPORT_REASONS = [
  { value: 'counterfeit',    label: '偽物疑い・コピー品の可能性' },
  { value: 'dangerous',      label: '危険商品・安全基準未達の可能性' },
  { value: 'pharmaceutical', label: '医薬品・医療機器っぽい（認証不明）' },
  { value: 'adult',          label: '成人向けコンテンツ' },
  { value: 'price_error',    label: '表示価格がおかしい・誤表示' },
  { value: 'spam',           label: 'スパム・無関係な商品' },
  { value: 'other',          label: 'その他' },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['value'];

interface ReportFormProps {
  offerId?: string;
  shopCode?: string;
  titleText?: string;
  demoMode: boolean;
}

export function ReportForm({ offerId, shopCode, titleText, demoMode }: ReportFormProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    setSubmitError(null);

    if (demoMode) {
      // デモモード: 実際には送信しない
      await new Promise((r) => setTimeout(r, 600));
      setSubmitting(false);
      setSubmitted(true);
      return;
    }

    // Supabase 設定済み時: reported_products テーブルへ INSERT
    try {
      const supabase = createClient();
      if (!supabase) {
        // フォールバック: Supabase クライアント取得失敗（NEXT_PUBLIC_ env vars が未設定の可能性）
        if (process.env.NODE_ENV === 'development') {
          console.error('[report] createClient() returned null — NEXT_PUBLIC_SUPABASE_URL or ANON_KEY が未設定です。dev サーバーを再起動してください。');
        }
        setSubmitError('送信に失敗しました。時間をおいて再度お試しください。');
        setSubmitting(false);
        return;
      }

      const payload = {
        offer_id:       offerId       ?? null,
        shop_code:      shopCode      ?? null,
        title_snapshot: titleText     ?? null,
        reason,
        comment:        comment.trim() || null,
        status:         'pending',
      };

      if (process.env.NODE_ENV === 'development') {
        console.info('[report] inserting payload:', payload);
      }

      const { error } = await supabase.from('reported_products').insert(payload);

      if (error) {
        // 開発時: error の全詳細をログに出す（診断用）
        if (process.env.NODE_ENV === 'development') {
          console.error('[report] insert failed:', {
            code:    error.code,
            message: error.message,
            details: error.details,
            hint:    error.hint,
          });
        }
        setSubmitError('送信に失敗しました。時間をおいて再度お試しください。');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[report] unexpected error:', err);
      }
      setSubmitError('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 px-6 py-8 text-center space-y-3">
        <p className="text-2xl" aria-hidden>✅</p>
        <p className="font-semibold text-green-800">報告を受け付けました</p>
        {demoMode && (
          <p className="text-xs text-green-600">
            ※ デモモードのため、実際の保存はされていません。Supabase 設定後に有効化されます。
          </p>
        )}
        <p className="text-xs text-gray-500 leading-relaxed">
          ご報告ありがとうございます。<br />
          内容を確認し、必要に応じてフィルタールールを更新します。
        </p>
        <Link href="/" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
          トップに戻る
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-200 px-5 py-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">報告内容</p>

      {/* エラー表示 */}
      {submitError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5">
          <p className="text-xs text-red-700">{submitError}</p>
        </div>
      )}

      {/* 報告理由 */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">
          報告理由 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-400"
                required
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* コメント */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700" htmlFor="report-comment">
          コメント（任意）
        </label>
        <textarea
          id="report-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="詳細があれば記入してください（最大500文字）"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
      </div>

      {/* 報告商品の参照情報（hidden） */}
      <input type="hidden" name="offerId"   value={offerId   ?? ''} />
      <input type="hidden" name="shopCode"  value={shopCode  ?? ''} />

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!reason || submitting}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '送信中...' : demoMode ? '報告する（デモ）' : '報告する'}
      </button>

      {demoMode && (
        <p className="text-xs text-gray-400 text-center leading-snug">
          デモモード: 送信は記録されません
        </p>
      )}
    </form>
  );
}
