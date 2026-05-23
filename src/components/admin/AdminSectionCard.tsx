import type { ReactNode } from 'react';

interface AdminSectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AdminSectionCard({
  title,
  description,
  children,
  className = '',
}: AdminSectionCardProps) {
  return (
    <section className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/** Supabase未設定 / 開発プレビュー用バナー */
export function AdminDevPreviewBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-4">
      <span className="text-lg leading-none mt-0.5">⚠️</span>
      <div>
        <p className="font-semibold">開発プレビュー表示</p>
        <p className="text-xs mt-0.5">
          {message ?? 'Supabase 未設定のため管理者判定は未有効です。デモデータ・静的設定を表示しています。'}
        </p>
      </div>
    </div>
  );
}

/** 保存未実装の通知 */
export function AdminSaveUnavailableBanner() {
  return (
    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-4">
      <span className="text-lg leading-none mt-0.5">ℹ️</span>
      <div>
        <p className="font-semibold">保存機能は Supabase 設定後に有効化予定</p>
        <p className="text-xs mt-0.5">
          現在は設定の閲覧・確認のみ可能です。変更を保存するには Supabase への接続と DB 設定が必要です。
        </p>
      </div>
    </div>
  );
}
