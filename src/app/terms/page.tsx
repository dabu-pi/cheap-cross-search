import Link from 'next/link';

export const metadata = {
  title: '利用規約 | 安買い横断サーチ',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">利用規約</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-gray-700 leading-relaxed">

        <p className="text-xs text-gray-400">最終更新: 2026-05-24（初版ドラフト）</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第1条 サービスの目的</h2>
          <p>
            安買い横断サーチ（以下「本サービス」）は、複数のオンラインショッピングサービスの
            商品価格・送料・配送予定を比較・参照するための情報提供サービスです。
            本サービスは商品の販売を行いません。実際の購入は各ショッピングサービスにて行っていただきます。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第2条 情報の正確性・保証の否定</h2>
          <p>
            本サービスが表示する価格・送料・在庫・到着予定日・商品情報は、
            各ショッピングサービスから取得した参考情報です。
            最新の情報は各ショッピングサービスの公式ページにてご確認ください。
          </p>
          <p>
            本サービスは商品の品質・安全性・合法性・真贋を保証しません。
            購入判断はご自身の責任において行ってください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第3条 禁止事項</h2>
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>違法な商品の検索・購入を目的とした利用</li>
            <li>本サービスへの自動アクセス・クローリング（正当なブラウザ利用を除く）</li>
            <li>本サービスのシステムへの不正アクセス・攻撃</li>
            <li>他のユーザーへの迷惑行為</li>
            <li>虚偽の問題報告</li>
            <li>その他、本サービスの運営を妨げる行為</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第4条 禁止商品カテゴリ</h2>
          <p>
            本サービスは、以下のカテゴリに該当すると判断された商品を自動フィルターまたは手動審査により
            表示しない場合があります。
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>違法品・規制品全般</li>
            <li>処方薬・向精神薬・規制医薬品</li>
            <li>武器・銃器・爆発物</li>
            <li>偽物・コピーブランド品</li>
            <li>成人向け商品（18歳未満に不適切なもの）</li>
            <li>危険物（火薬・毒物・危険化学物質）</li>
            <li>盗聴器・盗撮機器・不正監視機器</li>
            <li>その他、法令または公序良俗に反する商品</li>
          </ul>
          <p>
            詳細は<Link href="/safety-policy" className="text-blue-600 hover:underline">安全ポリシー</Link>をご覧ください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第5条 アフィリエイト・広告</h2>
          <p>
            本サービスは一部のリンクにアフィリエイトプログラムを利用する場合があります。
            該当リンクには「PR」バッジを表示します。
            アフィリエイト収入は表示される商品・価格・順位に影響しません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第6条 免責事項</h2>
          <p>
            本サービスの利用により生じた損害（商品の不良・配送トラブル・価格差・詐欺被害等）について、
            本サービスは一切の責任を負いません。
          </p>
          <p>
            本サービスは予告なく内容の変更・停止をすることがあります。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第7条 規約の変更</h2>
          <p>
            本規約は予告なく変更することがあります。
            変更後も本サービスを継続利用する場合は、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">プライバシーポリシー</Link>
          <Link href="/safety-policy" className="hover:text-gray-600">安全ポリシー</Link>
          <Link href="/disclaimer" className="hover:text-gray-600">免責事項</Link>
          <Link href="/" className="text-blue-500 hover:underline ml-auto">← トップに戻る</Link>
        </div>
      </div>
    </main>
  );
}
