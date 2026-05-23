/**
 * アフィリエイト設定管理ページ (Phase 6 更新)
 *
 * - 本番アフィリエイトID は絶対に Git に入れないこと
 * - ID は .env.local または Supabase DB で管理する
 * - このページはデモ設定の表示と、Phase 6 実装内容の確認に使う
 */

import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  AdminSectionCard,
  AdminDevPreviewBanner,
  AdminSaveUnavailableBanner,
} from '@/components/admin/AdminSectionCard';
import { getDemoAffiliateConfigs } from '@/lib/admin/demo-settings';
import {
  getDemoAffiliateSettings,
  generateTestLinkPreview,
} from '@/lib/affiliate/demo-settings';

const SHOP_COLORS: Record<string, string> = {
  amazon: '#FF9900',
  shein: '#000000',
  aliexpress: '#E62E04',
  temu: '#FF6533',
};

/** サンプル商品 URL（テストリンクプレビュー用） */
const SAMPLE_PRODUCT_URLS: Record<string, string> = {
  amazon:     'https://www.amazon.co.jp/dp/B08N5WRWNW',
  shein:      'https://jp.shein.com/product/sample-12345678.html',
  aliexpress: 'https://ja.aliexpress.com/item/1005004000000000.html',
  temu:       'https://www.temu.com/ul/sample-product-1.html',
};

function BoolBadge({ value, trueLabel = 'OK', falseLabel = 'NG' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

export default function AdminAffiliatePage() {
  const supabaseConfigured = isSupabaseConfigured();
  const configs = getDemoAffiliateConfigs();
  const affiliateSettings = getDemoAffiliateSettings();

  const enabledCount = configs.filter((c) => c.enabled).length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">アフィリエイト設定</h1>
      </div>

      {!supabaseConfigured && <AdminDevPreviewBanner />}
      <AdminSaveUnavailableBanner />

      {/* ─── セキュリティ警告 ─── */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 space-y-1">
        <p className="text-sm font-semibold text-amber-700">⚠️ セキュリティ注意事項</p>
        <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside leading-relaxed">
          <li>本番アフィリエイトID は絶対に Git リポジトリに入れないこと</li>
          <li>実 ID は <code className="bg-amber-100 px-1 rounded">.env.local</code> または Supabase の <code className="bg-amber-100 px-1 rounded">affiliate_settings</code> テーブルで管理すること</li>
          <li>現在表示されているのはデモ設定（affiliateId はすべて空文字）</li>
          <li>テストリンクプレビューは ID 未設定のため元の商品 URL を返す（安全フォールバック）</li>
        </ul>
      </div>

      {/* ─── アフィリエイト設定一覧 ─── */}
      <AdminSectionCard
        title="アフィリエイト設定一覧"
        description={`${configs.length} ショップ（有効: ${enabledCount} / 未設定: ${configs.length - enabledCount}）`}
      >
        <div className="space-y-6">
          {configs.map((config) => {
            const settings = affiliateSettings.find((s) => s.shopCode === config.shopCode);
            const sampleUrl = SAMPLE_PRODUCT_URLS[config.shopCode] ?? 'https://example.com';
            const testPreview = settings ? generateTestLinkPreview(settings, sampleUrl) : sampleUrl;

            return (
              <div key={config.shopCode} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: SHOP_COLORS[config.shopCode] ?? '#888' }}
                    />
                    <span className="font-semibold text-gray-900">{config.shopName}</span>
                  </div>
                  <BoolBadge value={config.enabled} trueLabel="有効" falseLabel="未設定" />
                </div>

                {/* 設定詳細 */}
                <div className="px-4 py-3 space-y-4">
                  {/* 基本設定 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">アフィリエイトID</span>
                        <span className={`text-xs font-mono ${config.affiliateId ? 'text-gray-800' : 'text-red-400'}`}>
                          {config.affiliateId || '（未設定 ⚠️）'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">価格表示許可</span>
                        <BoolBadge value={config.priceDisplayAllowed} trueLabel="許可" falseLabel="不可" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">画像表示許可</span>
                        <BoolBadge value={config.imageDisplayAllowed} trueLabel="許可" falseLabel="不可" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">キャッシュ時間</span>
                        <span className="text-gray-700 text-xs">{config.cacheMinutes} 分</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500 text-xs">リンクテンプレート</p>
                      <p className="text-xs text-gray-700 break-all font-mono bg-gray-50 rounded px-2 py-1 leading-relaxed">
                        {config.linkTemplate || '（テンプレートなし）'}
                      </p>
                    </div>
                  </div>

                  {/* トラッキングパラメータ */}
                  {settings && Object.keys(settings.trackingParams).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">トラッキングパラメータ</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(settings.trackingParams).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                          >
                            {key}={val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* テストリンクプレビュー */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">テストリンクプレビュー（ID 未設定 → 元 URL のまま）</p>
                    <p className="text-xs text-gray-600 break-all font-mono bg-gray-50 rounded px-2 py-1 leading-relaxed border border-gray-200">
                      {testPreview}
                    </p>
                  </div>

                  {/* 備考 */}
                  {config.notes && (
                    <p className="text-xs text-gray-500 border-t border-gray-100 pt-2">{config.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AdminSectionCard>

      {/* ─── Phase 6 実装状況 ─── */}
      <AdminSectionCard title="Phase 6 実装状況" description="アフィリエイト収益化の土台（2026-05-24 実装済み）">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'アフィリエイトURL生成', path: 'src/lib/affiliate/link-builder.ts', done: true, desc: 'buildAffiliateUrl / buildOfferClickUrl' },
              { label: 'クリック計測 Route', path: 'src/app/api/click/route.ts', done: true, desc: 'open redirect 対策済み・ホスト許可リスト' },
              { label: 'クリックイベント記録', path: 'src/lib/analytics/click-events.ts', done: true, desc: 'no-op（Supabase 設定後に有効化）' },
              { label: 'デモ設定', path: 'src/lib/affiliate/demo-settings.ts', done: true, desc: 'ID 空文字（実 ID は .env.local 管理）' },
              { label: 'ProductCard PR 表記', path: 'src/components/search/ProductCard.tsx', done: true, desc: 'PR バッジ・rel=sponsored・注意文' },
              { label: 'DB テーブル設計', path: 'docs/AFFILIATE_TRACKING_DESIGN.md', done: true, desc: 'affiliate_settings / click_events スキーマ' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <span className={`text-base mt-0.5 shrink-0 ${item.done ? 'text-green-500' : 'text-gray-300'}`}>
                  {item.done ? '✅' : '⏳'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{item.path}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminSectionCard>

      {/* ─── 今後の実装予定（Supabase 設定後） ─── */}
      <AdminSectionCard title="今後の実装予定（Supabase 設定後）" description="本番化に必要な追加作業">
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>実アフィリエイト ID を Supabase <code className="bg-gray-100 px-1 rounded text-xs">affiliate_settings</code> テーブルに保存</li>
          <li>商品リンクの <code className="bg-gray-100 px-1 rounded text-xs">affiliateUrl</code> に ID を自動適用</li>
          <li>クリックイベントを <code className="bg-gray-100 px-1 rounded text-xs">click_events</code> テーブルに記録（現在は no-op）</li>
          <li>ショップ別クリック数・CV 計測ダッシュボード</li>
          <li>アフィリエイトプログラム申請後に各ショップで有効化</li>
        </ul>
      </AdminSectionCard>
    </>
  );
}
