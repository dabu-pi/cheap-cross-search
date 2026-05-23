import Link from 'next/link';
import { BLOCKED_RULES, CAUTION_RULES } from '@/lib/safety/rules';
import { BLOCKED_KEYWORD_CATEGORY_LABELS } from '@/lib/admin/blocked-keywords';

export const metadata = {
  title: '安全ポリシー | 安買い横断サーチ',
};

/** カテゴリ別に集計 */
function groupByCategory<T extends { category: string; keywords: string[]; reason: string }>(
  rules: T[]
): Record<string, { keywords: string[]; reasons: string[] }> {
  const result: Record<string, { keywords: string[]; reasons: string[] }> = {};
  for (const rule of rules) {
    if (!result[rule.category]) {
      result[rule.category] = { keywords: [], reasons: [] };
    }
    result[rule.category].keywords.push(...rule.keywords);
    if (!result[rule.category].reasons.includes(rule.reason)) {
      result[rule.category].reasons.push(rule.reason);
    }
  }
  return result;
}

const blockedByCategory = groupByCategory(BLOCKED_RULES);
const cautionByCategory = groupByCategory(CAUTION_RULES);

export default function SafetyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">安全ポリシー</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-gray-700 leading-relaxed">

        <p className="text-xs text-gray-400">最終更新: 2026-05-24</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">安全フィルターについて</h2>
          <p>
            安買い横断サーチは、危険・不適切な商品がユーザーに表示されないよう、
            商品タイトルに対してキーワードベースの安全フィルターを適用しています。
          </p>
          <p>
            フィルターは 2 段階です：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="font-semibold text-red-700 text-sm mb-1">🚫 除外（非表示）</p>
              <p className="text-xs text-red-600">禁止商品カテゴリに該当する商品は検索結果から除外されます。</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="font-semibold text-amber-700 text-sm mb-1">⚠️ 要注意（警告付き表示）</p>
              <p className="text-xs text-amber-600">要注意カテゴリの商品は注意ラベル付きで表示されます。</p>
            </div>
          </div>
        </section>

        {/* ─── 除外カテゴリ ─── */}
        <section className="space-y-3">
          <h2 className="font-bold text-base text-gray-900">🚫 除外カテゴリ（非表示）</h2>
          <p className="text-xs text-gray-500">
            以下のカテゴリに該当する商品は検索結果に表示されません。
          </p>
          <div className="space-y-3">
            {Object.entries(blockedByCategory).map(([cat, data]) => (
              <div key={cat} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-1.5">
                <p className="font-semibold text-red-700 text-sm">
                  {BLOCKED_KEYWORD_CATEGORY_LABELS[cat] ?? cat}
                </p>
                <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                  {data.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 要注意カテゴリ ─── */}
        <section className="space-y-3">
          <h2 className="font-bold text-base text-gray-900">⚠️ 要注意カテゴリ（警告付き表示）</h2>
          <p className="text-xs text-gray-500">
            以下のカテゴリに該当する商品は「⚠️ 要注意」ラベル付きで表示されます。
            購入前に各ショップで詳細をご確認ください。
          </p>
          <div className="space-y-3">
            {Object.entries(cautionByCategory).map(([cat, data]) => (
              <div key={cat} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
                <p className="font-semibold text-amber-700 text-sm">
                  {BLOCKED_KEYWORD_CATEGORY_LABELS[cat] ?? cat}
                </p>
                <ul className="text-xs text-amber-600 list-disc list-inside space-y-0.5">
                  {data.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">問題報告・フィルターの更新</h2>
          <p>
            フィルターに漏れがある場合や、誤ってフィルターされた商品がある場合は、
            商品カードの「⚑ 問題を報告」からご連絡ください。
          </p>
          <p>
            受け付けた報告はチームが確認し、必要に応じてフィルタールールを更新します。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">フィルターの限界</h2>
          <p>
            本フィルターはキーワードベースの自動フィルターです。
            すべての危険商品・不適切商品を完全に除外することを保証しません。
            購入前に必ず各ショッピングサービスにて商品の詳細をご確認ください。
          </p>
        </section>

        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
          <Link href="/privacy" className="hover:text-gray-600">プライバシーポリシー</Link>
          <Link href="/disclaimer" className="hover:text-gray-600">免責事項</Link>
          <Link href="/" className="text-blue-500 hover:underline ml-auto">← トップに戻る</Link>
        </div>
      </div>
    </main>
  );
}
