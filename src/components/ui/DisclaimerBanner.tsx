/**
 * 免責バナー
 * 価格・送料・到着予定は参考情報であることを表示する
 */
export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
      <span className="font-semibold">⚠️ ご注意：</span>
      価格・送料・到着予定は取得時点の参考情報です。最終的な金額は各ショップでご確認ください。
    </div>
  );
}
