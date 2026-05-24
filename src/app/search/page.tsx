import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { ComparisonSection } from '@/components/search/ComparisonSection';
import { FavoriteQueryButton } from '@/components/search/FavoriteQueryButton';
import { SearchStatusSummary } from '@/components/search/SearchStatusSummary';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { crossSearch } from '@/lib/search/engine';
import { getDemoOffers } from '@/lib/search/demo-results';
import { saveSearchQuery } from '@/lib/favorites/actions';
import { filterProductOffers } from '@/lib/safety/filter-product-offers';
import { getShopByCode } from '@/lib/shops/shops';
import { buildClickTrackingUrl } from '@/lib/affiliate/link-builder';
import type { ProductOffer } from '@/lib/search/adapters/types';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 shrink-0" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <SearchBar initialQuery={query} />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!query ? (
          <EmptyState />
        ) : (
          <Suspense fallback={<SearchingSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        )}
      </div>
    </main>
  );
}

/** 検索結果（Server Component） */
async function SearchResults({ query }: { query: string }) {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ');

  // Phase 18: Amazon アフィリエイトタグ取得を crossSearch と並列実行
  const [crossResult, amazonTag] = await Promise.all([
    crossSearch(query),
    getAmazonAffiliateTag(),
  ]);
  // 検索クエリ保存はバックグラウンド（失敗しても無視）
  saveSearchQuery(query, normalizedQuery).catch(() => {});

  const apiOffers = crossResult.offers;

  // link_only ショップ（コンパクト直接検索セクション用）
  const linkOnlyShops = crossResult.shops.filter(
    (s) => s.status === 'link_only' || s.status === 'error'
  );

  // 表示するオファー: API取得 → なければキーワード対応デモデータ
  const demoOffers = getDemoOffers(query);
  const rawOffers = apiOffers.length > 0 ? apiOffers : demoOffers;

  // Phase 18: Amazon アフィリエイトタグをサーバーサイドで付与
  // affiliateUrl に tag 付き URL をセット。productUrl は変更しない。
  // affiliate_id 自体はクライアントに渡さず、生成済み URL のみをシリアライズする。
  const offersWithTags: ProductOffer[] = amazonTag
    ? rawOffers.map((offer) => {
        if (offer.shopCode === 'amazon' && !offer.affiliateUrl) {
          const taggedUrl = applyAmazonTag(offer.productUrl, amazonTag);
          if (taggedUrl !== offer.productUrl) {
            return { ...offer, affiliateUrl: taggedUrl };
          }
        }
        return offer;
      })
    : rawOffers;

  // Phase 7: 安全フィルター適用（Phase 18: tag 付きオファーを使用）
  const safetyResult = filterProductOffers(offersWithTags);
  const displayOffers = safetyResult.annotated.map((a) => a.offer);

  // Phase 12: Record 形式（Server→Client シリアライズ用）
  const cautionRecord: Record<string, string> = Object.fromEntries(
    safetyResult.annotated
      .filter((a) => a.safetyLevel === 'caution')
      .map((a) => [
        a.offer.id,
        a.cautionReason ?? '要注意商品です。購入前に各ショップで内容をご確認ください。',
      ])
  );

  const usingMock = apiOffers.some((o) => o.source === 'external_api_mock');
  const usingLegacyDemo = apiOffers.length === 0;

  return (
    <>
      {/* 検索情報 + 保存ボタン */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">「{query}」</span> の比較結果
          <span className="text-gray-400 ml-1">({displayOffers.length} 件)</span>
        </p>
        <FavoriteQueryButton query={query} />
      </div>

      {/* ショップ別取得状態サマリ */}
      <SearchStatusSummary shops={crossResult.shops} />

      {/* 参考価格バナー + 外部検索モード説明（モックデータ or レガシーデモ） */}
      {(usingMock || usingLegacyDemo) && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 flex items-start gap-2">
          <span className="text-blue-400 text-sm mt-0.5 shrink-0">📊</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong className="font-semibold">参考価格を表示中 · 外部検索モード</strong> —
              現在は各ECサイトの検索結果ページへご案内します。
              実際の価格・在庫・商品詳細は遷移先のショップでご確認ください。
            </p>
            {crossResult.globalWarnings && crossResult.globalWarnings.length > 0 && (
              <details className="mt-1">
                <summary className="text-xs text-blue-400 cursor-pointer">技術情報 ▼</summary>
                <ul className="mt-1 space-y-0.5">
                  {crossResult.globalWarnings.map((w, i) => (
                    <li key={i} className="text-xs text-blue-400 pl-2">• {w}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}

      {/* 免責バナー */}
      <DisclaimerBanner />

      {/* Phase 7: 安全フィルター状態表示 */}
      {(safetyResult.blockedCount > 0 || safetyResult.cautionCount > 0) && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-semibold text-amber-700">🛡️ 安全フィルター有効</span>
          {safetyResult.blockedCount > 0 && (
            <span className="text-xs text-amber-600">{safetyResult.blockedCount} 件を非表示にしました</span>
          )}
          {safetyResult.cautionCount > 0 && (
            <span className="text-xs text-amber-600">{safetyResult.cautionCount} 件に注意ラベルを表示</span>
          )}
          <Link href="/safety-policy" className="text-xs text-amber-500 hover:underline ml-auto">フィルター方針 →</Link>
        </div>
      )}

      {/* PR・アフィリエイト開示 */}
      <p className="text-xs text-gray-400 leading-relaxed px-1">
        ※ 一部リンクは<strong className="font-medium">アフィリエイトリンク（PR）</strong>です。
        リンク経由で購入されると当サービスに報酬が発生する場合があります。
        表示価格・ランキングへの影響はありません。
        <Link href="/disclaimer" className="text-blue-400 hover:underline ml-1 inline-block">詳細 →</Link>
      </p>

      {/* Phase 12: ComparisonSection — PriceComparisonBar + ProductCardGrid を shopFilter 共有で連動 */}
      <ComparisonSection
        offers={displayOffers}
        cautionRecord={cautionRecord}
        query={query}
      />

      {/* Phase 11: コンパクト直接検索セクション（Phase 13: /api/click 経由でクリック計測追加） */}
      {linkOnlyShops.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 space-y-2.5">
          <p className="text-xs font-semibold text-gray-500">
            🔍 各ECサイトで「{query}」を検索する
          </p>
          <p className="text-xs text-gray-400 -mt-1">
            ボタンを押すと各ECサイトの検索結果ページが開きます
          </p>
          <div className="grid grid-cols-2 gap-2">
            {linkOnlyShops.map((shopResult) => {
              const shopDef = getShopByCode(shopResult.shopCode);
              const color = shopDef?.logoColor ?? '#888';
              // Phase 13: /api/click 経由でクリック計測（source=direct_search で識別）
              const trackingUrl = shopResult.searchUrl
                ? buildClickTrackingUrl(
                    shopResult.searchUrl,
                    shopResult.shopCode,
                    undefined,
                    query
                  ) + '&source=direct_search'
                : '#';
              return (
                <a
                  key={shopResult.shopCode}
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border hover:shadow-sm transition-shadow"
                  style={{ borderLeftWidth: 3, borderLeftColor: color }}
                  aria-label={`${shopResult.shopName}で「${query}」を検索する`}
                >
                  <span className="text-sm font-semibold" style={{ color }}>
                    {shopResult.shopName}で検索
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            実際の商品・価格・在庫は各ショップの購入画面でご確認ください。
          </p>
        </div>
      )}

      {/* Phase 21: 関連キーワード候補 */}
      <RelatedKeywords query={query} />

      {/* フッター注意文 */}
      <div className="text-center py-4 space-y-1">
        <p className="text-xs text-gray-400 leading-relaxed">
          表示価格・送料・到着予定・在庫は取得時点の参考情報です。<br />
          クーポン適用後価格・実在庫は各ショップの購入画面でご確認ください。<br />
          当サイトは商品・価格の正確性を保証しません。
        </p>
        <Link href="/disclaimer" className="text-xs text-blue-400 hover:underline inline-block">
          免責事項を読む →
        </Link>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Phase 18: Amazon アフィリエイトタグ付与ヘルパー（サーバーサイド専用）
// ─────────────────────────────────────────────────────────────────

/**
 * Supabase RPC 経由で Amazon アフィリエイトタグを取得する。
 * DB 未接続・行なし・enabled=false の場合は null を返す（フォールバック）。
 *
 * SECURITY DEFINER 関数 get_amazon_affiliate_tag() を使う。
 * これにより anon ロールから admin_users テーブルへの権限なしに
 * affiliate_settings を安全に読み取れる。
 *
 * ⚠️ この関数の戻り値は Server Component 内でのみ使用すること。
 *    affiliate_id をそのままクライアントコンポーネントの props に渡さないこと。
 */
async function getAmazonAffiliateTag(): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/rpc/get_amazon_affiliate_tag`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
        // 毎リクエストごとに最新値を取得（キャッシュしない）
        cache: 'no-store',
      }
    );

    if (!res.ok) return null;
    const tag = (await res.json()) as string | null;
    return tag || null;
  } catch {
    return null;
  }
}

/**
 * Amazon 検索 URL に `tag` パラメータを付与する。
 * URL パースに失敗した場合は元の URL をそのまま返す（安全フォールバック）。
 */
function applyAmazonTag(productUrl: string, affiliateTag: string): string {
  if (!affiliateTag) return productUrl;
  try {
    const url = new URL(productUrl);
    url.searchParams.set('tag', affiliateTag);
    return url.toString();
  } catch {
    return productUrl;
  }
}

// ─────────────────────────────────────────────────────────────────
// Phase 21: 関連キーワード候補 + カテゴリ別 EmptyState
// ─────────────────────────────────────────────────────────────────

/** Phase 21: カテゴリ別人気キーワード（EmptyState / 関連キーワードで共用） */
const CATEGORY_QUERIES = [
  {
    label: '家電・ガジェット',
    emoji: '📱',
    queries: ['ワイヤレスイヤホン', 'スマートウォッチ', 'モバイルバッテリー', 'USBハブ'],
  },
  {
    label: 'ファッション・バッグ',
    emoji: '👜',
    queries: ['スマホケース', 'バッグ', 'リュック', '財布'],
  },
  {
    label: 'スポーツ・健康',
    emoji: '💪',
    queries: ['プロテイン', 'ヨガマット', '水筒', 'ランニングシューズ'],
  },
  {
    label: '日用品・ペット',
    emoji: '🐾',
    queries: ['ペット用品', '収納ボックス', 'タンブラー', 'エコバッグ'],
  },
];

/**
 * Phase 21: クエリに関連するキーワード候補を返す静的マップ。
 * 完全一致 → 部分一致 → 人気カテゴリ一覧 の順でフォールバック。
 */
const RELATED_KEYWORDS_MAP: Record<string, string[]> = {
  ワイヤレスイヤホン: ['ノイズキャンセリングイヤホン', '完全ワイヤレスイヤホン', '骨伝導イヤホン', 'ヘッドホン', 'スピーカー'],
  イヤホン: ['ワイヤレスイヤホン', 'ノイズキャンセリングイヤホン', '有線イヤホン', 'ヘッドホン'],
  スマホケース: ['iPhoneケース', 'Androidケース', '手帳型ケース', 'スマートフォンアクセサリー', '保護フィルム'],
  バッグ: ['リュック', 'トートバッグ', 'ショルダーバッグ', 'ハンドバッグ', '財布'],
  リュック: ['バッグ', 'トートバッグ', 'ショルダーバッグ', 'デイパック'],
  プロテイン: ['プロテインバー', 'BCAAサプリ', 'クレアチン', 'スポーツドリンク', 'ダイエット食品'],
  ペット用品: ['猫用品', '犬用品', 'ペットフード', 'キャットタワー', 'ペットシーツ'],
  家電: ['掃除機', '電気ケトル', 'コーヒーメーカー', '空気清浄機', '加湿器'],
  スマートウォッチ: ['活動量計', 'スマートバンド', 'Apple Watch', 'ウォッチバンド'],
  充電器: ['モバイルバッテリー', 'USBケーブル', 'ワイヤレス充電', 'USB-Cケーブル'],
  財布: ['長財布', '二つ折り財布', 'マネークリップ', 'カードケース', 'バッグ'],
  水筒: ['タンブラー', 'マグボトル', 'スポーツボトル', 'エコバッグ'],
};

function getRelatedKeywords(query: string): string[] {
  const q = query.trim();
  if (RELATED_KEYWORDS_MAP[q]) return RELATED_KEYWORDS_MAP[q];
  // 部分一致
  for (const [key, values] of Object.entries(RELATED_KEYWORDS_MAP)) {
    if (q.includes(key) || key.includes(q)) return values;
  }
  // フォールバック: 全カテゴリから1件ずつ
  return CATEGORY_QUERIES.flatMap((c) => c.queries.slice(0, 1));
}

/** Phase 21: 関連キーワード候補セクション */
function RelatedKeywords({ query }: { query: string }) {
  const related = getRelatedKeywords(query);
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500">🔗 こんなキーワードも人気</p>
      <div className="flex flex-wrap gap-2">
        {related.map((kw) => (
          <a
            key={kw}
            href={`/search?q=${encodeURIComponent(kw)}`}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {kw}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Phase 21: カテゴリ別 EmptyState */
function EmptyState() {
  return (
    <div className="py-8 space-y-6">
      {/* メインメッセージ */}
      <div className="text-center space-y-2">
        <p className="text-4xl">🛒</p>
        <p className="text-gray-800 font-bold text-lg">何を比較しますか？</p>
        <p className="text-sm text-gray-400">
          Amazon・SHEIN・AliExpress・Temu の参考価格を一度に確認
        </p>
      </div>

      {/* 外部検索モード説明 */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 flex items-start gap-2">
        <span className="text-blue-400 text-sm mt-0.5 shrink-0">🔍</span>
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong className="font-semibold">外部検索モード</strong> —
          現在は各ECサイトの検索結果ページへご案内します。
          実際の価格・在庫・商品詳細は遷移先のショップでご確認ください。
        </p>
      </div>

      {/* Phase 21: カテゴリ別人気キーワード */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-gray-500">人気カテゴリから探す</p>
        {CATEGORY_QUERIES.map((cat) => (
          <div key={cat.label} className="space-y-1.5">
            <p className="text-xs text-gray-500 font-medium">
              {cat.emoji} {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.queries.map((q) => (
                <a
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
                >
                  {q}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 使い方ガイド */}
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500">使い方</p>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside leading-relaxed">
          <li>上の検索バーにキーワードを入力して Enter</li>
          <li>4ショップの参考価格帯を一覧比較</li>
          <li>気になるショップのリンクから各ECサイトの検索結果ページへ</li>
        </ol>
        <p className="text-xs text-gray-400 pt-1">
          ※ 表示価格は参考価格です。実際の金額は各ショップでご確認ください。
        </p>
      </div>
    </div>
  );
}

/** ローディング中スケルトン */
function SearchingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl border shadow-sm bg-white overflow-hidden animate-pulse">
          <div className="px-4 py-2.5 flex items-center gap-3">
            <div className="h-5 bg-gray-200 rounded-full w-16" />
            <div className="h-4 bg-gray-100 rounded-full w-20" />
          </div>
          <div className="px-4 py-3 flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-5 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 flex justify-between items-center">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded-xl w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
