import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | ECサイト比較.com',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700" aria-label="トップへ">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">プライバシーポリシー</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-sm text-gray-700 leading-relaxed">

        <p className="text-xs text-gray-400">最終更新: 2026-05-24（初版ドラフト）</p>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">収集する情報</h2>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-800 mb-1">① アカウント情報（ログイン時）</p>
              <p>
                メールアドレス・パスワード（ハッシュ化）、またはGoogleアカウント情報を
                Supabase Auth を通じて収集します。
                これらは認証目的にのみ使用し、第三者に提供しません。
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">② 検索・行動データ（任意）</p>
              <p>
                ログイン時に、検索履歴・お気に入り商品・お気に入り検索ワードを保存することがあります。
                これらはユーザー本人のみが閲覧でき、サービス改善に活用する場合があります。
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">③ クリックログ</p>
              <p>
                商品リンクのクリックは計測目的で記録される場合があります。
                記録内容: クリック先ショップ・クリック時刻・検索クエリ（匿名）。
                個人を特定する情報とは紐づけません（ログイン時のユーザーIDを除く）。
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-1">④ 問題報告</p>
              <p>
                問題報告フォームから送信された内容（報告理由・コメント・対象商品ID）を
                保存することがあります。サービス品質向上に活用します。
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">収集しない情報</h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>実名・住所・電話番号（ログインに不要なため収集しません）</li>
            <li>クレジットカード・決済情報（当サービスで決済は行いません）</li>
            <li>位置情報</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">Cookieおよびローカルストレージ</h2>
          <p>
            本サービスはセッション管理のためのCookieを使用します。
            また、並び替え設定等のユーザー設定をブラウザのローカルストレージに保存することがあります。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">アフィリエイト計測</h2>
          <p>
            商品リンクのクリックを計測するため、本サービスのサーバー（<code className="bg-gray-100 px-1 rounded">/api/click</code>）を
            経由してリダイレクトします。
            クリックデータはアフィリエイト報酬の計算と広告効果測定に使用されます。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">第三者サービス</h2>
          <div className="space-y-2">
            <div>
              <p className="font-medium text-gray-800">Supabase</p>
              <p className="text-xs text-gray-500">認証・データベース管理に使用します。詳細は Supabase のプライバシーポリシーをご確認ください。</p>
            </div>
            <div>
              <p className="font-medium text-gray-800">各ショッピングサービス（Amazon / SHEIN / AliExpress / Temu）</p>
              <p className="text-xs text-gray-500">商品リンクをクリックすると各サービスのサイトへ遷移します。各サービスのプライバシーポリシーが適用されます。</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">情報の保護</h2>
          <p>
            収集した情報はSupabase（Row Level Security 有効）で管理し、
            ユーザー本人のみがアクセスできる状態を維持します。
            不正アクセスを防ぐための技術的措置を講じています。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-gray-900">お問い合わせ</h2>
          <p>
            本ポリシーに関するご質問は、お問い合わせフォーム（準備中）よりご連絡ください。
          </p>
        </section>

        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
          <Link href="/safety-policy" className="hover:text-gray-600">安全ポリシー</Link>
          <Link href="/disclaimer" className="hover:text-gray-600">免責事項</Link>
          <Link href="/" className="text-blue-500 hover:underline ml-auto">← トップに戻る</Link>
        </div>
      </div>
    </main>
  );
}
