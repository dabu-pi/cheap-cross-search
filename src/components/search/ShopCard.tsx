import { ShopSearchResult } from '@/lib/search/adapters/types';
import { getShopByCode } from '@/lib/shops/shops';

interface ShopCardProps {
  result: ShopSearchResult;
  query: string;
}

/**
 * ショップ別の検索結果カード
 * Phase 1: link_only モード（検索リンクのみ表示）
 * Phase 5以降: 商品カードに拡張予定
 */
export function ShopCard({ result, query }: ShopCardProps) {
  const shop = getShopByCode(result.shopCode);
  const logoColor = shop?.logoColor ?? '#666';

  const isDisabled = result.status === 'disabled';
  const hasError = result.status === 'error';

  return (
    <div
      className={`rounded-2xl border shadow-sm bg-white overflow-hidden transition-shadow hover:shadow-md ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      {/* ショップヘッダー */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderLeft: `4px solid ${logoColor}` }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-gray-900">{result.shopName}</span>
          <StatusBadge status={result.status} mode={result.integrationMode} />
        </div>
        {!isDisabled && result.searchUrl && (
          <a
            href={result.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            「{query}」で検索
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* 商品エリア（Phase 5以降で商品カードを表示） */}
      {hasError ? (
        <div className="px-5 py-4 text-sm text-red-500 bg-red-50">
          ⚠️ {result.errorMessage ?? '取得エラー'}
        </div>
      ) : isDisabled ? (
        <div className="px-5 py-4 text-sm text-gray-400">このショップは現在停止中です</div>
      ) : result.offers.length > 0 ? (
        // 将来: 商品カード一覧を表示
        <div className="px-5 py-4">
          <p className="text-sm text-gray-500">{result.offers.length} 件取得</p>
        </div>
      ) : (
        <div className="px-5 py-4 bg-gray-50 text-sm text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          上のリンクからショップで検索結果をご確認ください
        </div>
      )}
    </div>
  );
}

/** ステータスバッジ */
function StatusBadge({
  status,
  mode,
}: {
  status: ShopSearchResult['status'];
  mode: ShopSearchResult['integrationMode'];
}) {
  if (status === 'disabled') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">停止中</span>
    );
  }
  if (status === 'error') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">エラー</span>
    );
  }
  // status=link_only（APIエラー時のフォールバック含む）または mode=link_only
  if (status === 'link_only' || mode === 'link_only') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">検索対応</span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">取得中</span>
  );
}
