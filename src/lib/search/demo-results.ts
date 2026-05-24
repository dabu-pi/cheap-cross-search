/**
 * Phase 2 デモ用商品オファー（Phase 10 でキーワード対応）
 *
 * 実 API 接続実装前の UI 確認用サンプルデータ。
 * source: 'demo' で識別可能。
 * 各種欠損パターン（送料不明・評価なし・画像なし・価格信頼度 low / unknown）を含む。
 *
 * ⚠️ 価格・商品名・評価はすべて架空のダミーデータです。
 */

import { ProductOffer } from './adapters/types';

/**
 * デモオファーを返す。query を渡すとキーワードを含むタイトル・検索 URL を生成する。
 * 同じクエリに対しては決定的な価格を返す（ページリロード時に価格が変わらない）。
 */
export function getDemoOffers(query?: string): ProductOffer[] {
  const kw = query?.trim() || 'スマホケース';
  const now = new Date().toISOString();

  // クエリのシードで価格を微妙に変化させる（同じクエリ → 同じ価格）
  const h = kw.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0);
  /** base を起点に seed % spread 分ずらし、10円単位で丸める */
  const pv = (base: number, spread: number): number =>
    Math.round((base + (h % spread)) / 10) * 10;

  // 各ショップの検索 URL（検索語を含む）
  const amzUrl  = `https://www.amazon.co.jp/s?k=${encodeURIComponent(kw)}`;
  const sheinUrl = `https://jp.shein.com/pdsearch/${encodeURIComponent(kw)}/`;
  const aliUrl  = `https://ja.aliexpress.com/w/wholesale-${encodeURIComponent(kw)}.html`;
  const temuUrl = `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(kw)}`;

  return [
    // ─────────────────── Amazon ────────────────────────────
    {
      id: 'demo-amazon-1',
      shopCode: 'amazon',
      shopName: 'Amazon',
      title: `耐衝撃 ${kw} クリア 透明 TPU 薄型 四隅補強 [国内メーカー保証付き]`,
      imageUrl: undefined,
      productUrl: amzUrl,
      affiliateUrl: undefined,
      itemPrice: pv(1280, 400),
      shippingPrice: 0,
      estimatedTotalPrice: pv(1280, 400),
      currency: 'JPY',
      taxIncludedStatus: 'included',
      deliveryEstimateText: '翌日配送',
      rating: 4.2,
      reviewCount: 1234,
      priceConfidence: 'high',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },
    {
      id: 'demo-amazon-2',
      shopCode: 'amazon',
      shopName: 'Amazon',
      title: `[Amazon's Choice] ${kw} 日本正規品 高品質 人気モデル`,
      imageUrl: undefined,
      productUrl: amzUrl,
      affiliateUrl: undefined,
      itemPrice: pv(2480, 600),
      shippingPrice: 0,
      estimatedTotalPrice: pv(2480, 600),
      currency: 'JPY',
      taxIncludedStatus: 'included',
      deliveryEstimateText: '翌日〜2日',
      rating: 4.5,
      reviewCount: 2341,
      priceConfidence: 'high',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },
    {
      id: 'demo-amazon-3',
      shopCode: 'amazon',
      shopName: 'Amazon',
      title: `コスパ重視 ${kw} スタンダードモデル 返品保証`,
      imageUrl: undefined,
      productUrl: amzUrl,
      affiliateUrl: undefined,
      itemPrice: pv(890, 300),
      shippingPrice: 0,
      estimatedTotalPrice: pv(890, 300),
      currency: 'JPY',
      taxIncludedStatus: 'included',
      deliveryEstimateText: '翌日配送',
      rating: 4.0,
      reviewCount: 890,
      priceConfidence: 'high',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },

    // ─────────────────── SHEIN ─────────────────────────────
    {
      id: 'demo-shein-1',
      shopCode: 'shein',
      shopName: 'SHEIN',
      title: `トレンド ${kw} おしゃれデザイン 韓国スタイル ソフト素材`,
      imageUrl: undefined,
      productUrl: sheinUrl,
      affiliateUrl: undefined,
      itemPrice: pv(450, 200),
      shippingPrice: undefined, // 条件付き無料のため不明
      estimatedTotalPrice: undefined,
      currency: 'JPY',
      taxIncludedStatus: 'unknown',
      deliveryEstimateText: '5〜10日',
      rating: 4.1,
      reviewCount: 567,
      priceConfidence: 'medium',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },
    {
      id: 'demo-shein-2',
      shopCode: 'shein',
      shopName: 'SHEIN',
      title: `シンプル ${kw} ユニセックス ファッション フラワー柄`,
      imageUrl: undefined,
      productUrl: sheinUrl,
      affiliateUrl: undefined,
      itemPrice: pv(380, 150),
      shippingPrice: undefined,
      estimatedTotalPrice: undefined,
      currency: 'JPY',
      taxIncludedStatus: 'unknown',
      deliveryEstimateText: undefined, // 到着予定不明
      rating: 3.9,
      reviewCount: 234,
      priceConfidence: 'medium',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },

    // ─────────────────── AliExpress ────────────────────────
    {
      id: 'demo-aliexpress-1',
      shopCode: 'aliexpress',
      shopName: 'AliExpress',
      title: `格安 ${kw} 直輸入 4色展開 耐衝撃 多機種対応`,
      imageUrl: undefined,
      productUrl: aliUrl,
      affiliateUrl: undefined,
      itemPrice: pv(380, 150),
      shippingPrice: 200,
      estimatedTotalPrice: pv(380, 150) + 200,
      currency: 'JPY',
      taxIncludedStatus: 'excluded', // 関税別途の可能性あり
      deliveryEstimateText: '2〜4週間',
      rating: 3.8,
      reviewCount: 1560,
      priceConfidence: 'low',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },
    {
      id: 'demo-aliexpress-2',
      shopCode: 'aliexpress',
      shopName: 'AliExpress',
      title: `${kw} コスパ抜群 薄型 耐久性 マット仕上げ 送料無料`,
      imageUrl: undefined,
      productUrl: aliUrl,
      affiliateUrl: undefined,
      itemPrice: pv(520, 200),
      shippingPrice: 0,
      estimatedTotalPrice: pv(520, 200),
      currency: 'JPY',
      taxIncludedStatus: 'excluded',
      deliveryEstimateText: undefined, // 到着予定不明
      rating: 4.0,
      reviewCount: 3200,
      priceConfidence: 'low',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },

    // ─────────────────── Temu ──────────────────────────────
    {
      id: 'demo-temu-1',
      shopCode: 'temu',
      shopName: 'Temu',
      title: `激安 ${kw} お買い得セット 送料無料 ソフトタイプ`,
      imageUrl: undefined,
      productUrl: temuUrl,
      affiliateUrl: undefined,
      itemPrice: pv(280, 120),
      shippingPrice: undefined,
      estimatedTotalPrice: undefined,
      currency: 'JPY',
      taxIncludedStatus: 'unknown',
      deliveryEstimateText: undefined,
      rating: undefined, // 評価なし
      reviewCount: undefined,
      priceConfidence: 'unknown',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },
    {
      id: 'demo-temu-2',
      shopCode: 'temu',
      shopName: 'Temu',
      title: `${kw} まとめ買いセット 超格安 コスパ最高 3個入り`,
      imageUrl: undefined,
      productUrl: temuUrl,
      affiliateUrl: undefined,
      itemPrice: pv(650, 200),
      shippingPrice: undefined,
      estimatedTotalPrice: undefined,
      currency: 'JPY',
      taxIncludedStatus: 'unknown',
      deliveryEstimateText: undefined,
      rating: 3.5,
      reviewCount: 89,
      priceConfidence: 'unknown',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },

    // ─── 安全フィルターUI確認用 caution デモ商品 ──────────────────────
    // ⚠️ Phase 7 テスト用：「モバイルバッテリー」は caution ルールにマッチ
    {
      id: 'demo-aliexpress-3',
      shopCode: 'aliexpress',
      shopName: 'AliExpress',
      title: `大容量 モバイルバッテリー 内蔵 ${kw} 充電ケース 急速充電 Type-C`,
      imageUrl: undefined,
      productUrl: aliUrl,
      affiliateUrl: undefined,
      itemPrice: pv(1580, 400),
      shippingPrice: 0,
      estimatedTotalPrice: pv(1580, 400),
      currency: 'JPY',
      taxIncludedStatus: 'excluded',
      deliveryEstimateText: '2〜3週間',
      rating: 3.7,
      reviewCount: 450,
      priceConfidence: 'low',
      fetchedAt: now,
      source: 'demo',
      isSponsored: false,
    },
  ];
}
