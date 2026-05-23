/**
 * 安全フィルタールール定義 (Phase 7)
 *
 * 静的ルール一覧。将来は Supabase の blocked_keywords / blocked_categories
 * テーブルに移行し、管理画面から追加・編集・無効化できるようにする。
 *
 * ─── 優先順位 ─────────────────────────────────────────────────────
 * 1. blocked ルールが 1 件でもマッチ → 表示しない
 * 2. caution ルールがマッチ → 注意ラベル付きで表示
 * 3. いずれもマッチしない → 通常表示
 */

import type { SafetyKeywordRule } from './types';

// ─────────────────────────────────────────────────────────────────────────
// BLOCKED ルール（表示しない）
// ─────────────────────────────────────────────────────────────────────────

export const BLOCKED_RULES: SafetyKeywordRule[] = [
  // ── 違法品 ──────────────────────────────────────────────────────────
  { id: 'bl-illegal-01', keywords: ['違法'], level: 'blocked', category: 'illegal', reason: '違法商品の可能性' },
  { id: 'bl-illegal-02', keywords: ['脱税', '密輸'], level: 'blocked', category: 'illegal', reason: '違法行為関連' },

  // ── 医薬品・処方薬 ────────────────────────────────────────────────
  { id: 'bl-pharma-01', keywords: ['処方箋', '処方薬', '睡眠薬', 'ステロイド'], level: 'blocked', category: 'pharmaceutical', reason: '処方薬・規制医薬品の可能性' },
  { id: 'bl-pharma-02', keywords: ['向精神薬', '麻薬', '覚醒剤', '大麻'], level: 'blocked', category: 'pharmaceutical', reason: '規制薬物' },
  { id: 'bl-pharma-03', keywords: ['ED薬', '勃起', 'バイアグラ', 'シアリス'], level: 'blocked', category: 'pharmaceutical', reason: '処方薬（ED系）' },

  // ── 武器・刃物 ────────────────────────────────────────────────────
  { id: 'bl-weapon-01', keywords: ['実銃', '拳銃', '散弾銃', 'ライフル', '銃弾'], level: 'blocked', category: 'weapon', reason: '銃器関連' },
  { id: 'bl-weapon-02', keywords: ['爆発物', '爆弾', '地雷', '手榴弾'], level: 'blocked', category: 'weapon', reason: '爆発物' },
  { id: 'bl-weapon-03', keywords: ['スタンガン', '護身用電撃'], level: 'blocked', category: 'weapon', reason: '電撃武器（規制確認中）' },

  // ── 偽物・コピー品 ────────────────────────────────────────────────
  { id: 'bl-fake-01', keywords: ['スーパーコピー', 'N品', 'コピーブランド'], level: 'blocked', category: 'counterfeit', reason: '商標権侵害品の可能性' },
  { id: 'bl-fake-02', keywords: ['ロレックスコピー', 'グッチコピー', 'シャネルコピー', 'ルイヴィトンコピー'], level: 'blocked', category: 'counterfeit', reason: 'ブランドコピー品' },

  // ── 成人向け ──────────────────────────────────────────────────────
  { id: 'bl-adult-01', keywords: ['成人向け', '18禁', 'アダルト', 'ポルノ'], level: 'blocked', category: 'adult', reason: '成人向けコンテンツ' },
  { id: 'bl-adult-02', keywords: ['ラブドール', 'ダッチワイフ'], level: 'blocked', category: 'adult', reason: '成人向け商品' },

  // ── 危険物 ────────────────────────────────────────────────────────
  { id: 'bl-hazard-01', keywords: ['爆竹', '発煙筒', '火薬'], level: 'blocked', category: 'hazardous', reason: '火薬類取締法対象の可能性' },
  { id: 'bl-hazard-02', keywords: ['劇薬', '毒物', '化学兵器'], level: 'blocked', category: 'hazardous', reason: '危険化学物質' },

  // ── 盗聴・監視系 ──────────────────────────────────────────────────
  { id: 'bl-surv-01', keywords: ['盗聴器', '盗撮', 'ピンホールカメラ隠し'], level: 'blocked', category: 'surveillance', reason: '盗聴・盗撮機器' },
  { id: 'bl-surv-02', keywords: ['GPS追跡', 'ストーカー'], level: 'blocked', category: 'surveillance', reason: 'ストーカー目的利用のリスク' },
  { id: 'bl-surv-03', keywords: ['スパイウェア', 'キーロガー', '盗み見'], level: 'blocked', category: 'surveillance', reason: '不正監視ソフトウェア' },

  // ── ギャンブル ────────────────────────────────────────────────────
  { id: 'bl-gamble-01', keywords: ['カジノチップ偽造', 'スロット改造', 'パチンコ台改造'], level: 'blocked', category: 'gambling', reason: 'ギャンブル不正改造関連' },

  // ── タバコ・ニコチン（未成年保護） ────────────────────────────────
  { id: 'bl-tobacco-01', keywords: ['電子タバコ本体', 'IQOS本体', 'ニコチンリキッド'], level: 'blocked', category: 'tobacco', reason: 'タバコ・ニコチン製品（年齢確認不可のため除外）' },
];

// ─────────────────────────────────────────────────────────────────────────
// CAUTION ルール（注意ラベル付きで表示）
// ─────────────────────────────────────────────────────────────────────────

export const CAUTION_RULES: SafetyKeywordRule[] = [
  // ── 食品・サプリ ──────────────────────────────────────────────────
  { id: 'ca-food-01', keywords: ['サプリ', 'サプリメント', '健康食品', 'プロテイン'], level: 'caution', category: 'food_supplement', reason: '食品・サプリ類：原材料・アレルゲン・効能は各ショップで要確認' },
  { id: 'ca-food-02', keywords: ['ダイエット食品', 'スリミング', '痩身'], level: 'caution', category: 'food_supplement', reason: '痩身・ダイエット系食品：効果・成分を各ショップで要確認' },

  // ── ベビー・子ども用品 ────────────────────────────────────────────
  { id: 'ca-baby-01', keywords: ['ベビー', '赤ちゃん', '乳児', '哺乳'], level: 'caution', category: 'baby', reason: 'ベビー用品：安全基準・認証を各ショップで要確認' },
  { id: 'ca-baby-02', keywords: ['子ども用', 'キッズ玩具', 'おもちゃ 幼児'], level: 'caution', category: 'baby', reason: '子ども用品：安全基準・年齢対象を各ショップで要確認' },

  // ── コスメ・スキンケア ────────────────────────────────────────────
  { id: 'ca-cosme-01', keywords: ['美白クリーム', '育毛', '発毛', 'にきびケア'], level: 'caution', category: 'cosmetic', reason: 'スキンケア・美容系：成分・使用上の注意を各ショップで要確認' },
  { id: 'ca-cosme-02', keywords: ['医薬部外品', '薬用', '効能'], level: 'caution', category: 'cosmetic', reason: '医薬部外品・薬用化粧品：認証・効能表示を各ショップで要確認' },

  // ── 電源・バッテリー ──────────────────────────────────────────────
  { id: 'ca-battery-01', keywords: ['モバイルバッテリー', 'リチウムイオン', '大容量バッテリー'], level: 'caution', category: 'battery', reason: 'バッテリー製品：PSEマーク・安全規格を各ショップで要確認' },
  { id: 'ca-battery-02', keywords: ['充電器 急速', 'ACアダプタ', '電源タップ'], level: 'caution', category: 'battery', reason: '電源系製品：PSEマーク・安全規格を各ショップで要確認' },

  // ── ブランド品（偽物リスク） ──────────────────────────────────────
  { id: 'ca-brand-01', keywords: ['ルイヴィトン', 'グッチ', 'シャネル', 'エルメス', 'ロレックス', 'バーバリー'], level: 'caution', category: 'brand_luxury', reason: '高額ブランド品：偽物リスクあり。正規店・公式サイトでの購入を推奨' },
  { id: 'ca-brand-02', keywords: ['激安ブランド', 'ブランドコピー疑い'], level: 'caution', category: 'brand_luxury', reason: '偽物疑いの可能性：購入前に各ショップの評価を十分確認してください' },

  // ── 医療・衛生系っぽい ────────────────────────────────────────────
  { id: 'ca-medical-01', keywords: ['血糖計', '血圧計', '体温計'], level: 'caution', category: 'pharmaceutical', reason: '医療機器：認証・精度を各ショップで要確認' },
  { id: 'ca-medical-02', keywords: ['マスク 医療用', 'サージカル', '医療グレード'], level: 'caution', category: 'pharmaceutical', reason: '医療用途表示：認証・規格を各ショップで要確認' },
];

/** 全ルール（blocked + caution） */
export const ALL_SAFETY_RULES: SafetyKeywordRule[] = [...BLOCKED_RULES, ...CAUTION_RULES];
