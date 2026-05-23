import Link from 'next/link';

export const metadata = {
  title: '免責事項 | 安買い横断サーチ',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">免責事項</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">価格・送料について</h2>
          <p>
            当サービスが表示する価格・送料は、各ショップのAPIまたはウェブサイトから取得した
            <strong>取得時点の参考情報</strong>です。
            実際の購入金額とは異なる場合があります。
          </p>
          <p>
            最終的な価格・送料・税額は、各ショップの購入確認画面にてご確認ください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">到着予定日について</h2>
          <p>
            表示される到着予定日は参考情報であり、実際の配送状況・在庫状況・天候・税関手続き等により
            大幅に異なる場合があります。
            特に海外発送の商品については数週間以上かかる場合があります。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">商品情報の正確性について</h2>
          <p>
            当サービスは商品情報の正確性・完全性を保証しません。
            商品の仕様・品質・安全性については各ショップおよびメーカーにご確認ください。
          </p>
          <p>
            偽物・模倣品・安全基準を満たさない商品が含まれる可能性があります。
            購入の判断はご自身の責任において行ってください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">「最安」表示について</h2>
          <p>
            当サービスは「最安値」を保証しません。
            表示される価格は「取得時点の参考価格」または「合計見込み価格」です。
            実際に最も安い商品を見つけるためには、各ショップで直接ご確認ください。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">アフィリエイトについて</h2>
          <p>
            当サービスは一部のショップについてアフィリエイトプログラムを利用しています。
            商品リンクをクリックして購入された場合、当サービスに報酬が発生することがあります。
            これにより表示内容が操作されることはありません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">免責</h2>
          <p>
            当サービスの利用により生じた損害（商品の不良・配送遅延・価格差等）について、
            当サービスは一切の責任を負いません。
          </p>
        </section>

        <div className="pt-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← トップに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
