/**
 * 安全フィルター型定義 (Phase 7)
 *
 * 商品表示前の安全チェックに使用する型。
 * 将来は Supabase の blocked_keywords / blocked_categories テーブルに移行する。
 *
 * @see src/lib/safety/rules.ts       — 静的ルール定義
 * @see src/lib/safety/filter-product-offers.ts — フィルター実装
 */

import type { ProductOffer } from '@/lib/search/adapters/types';

/**
 * 安全レベル
 * - blocked: 表示しない（禁止商品・危険商品）
 * - caution: 注意ラベル付きで表示（要注意商品）
 * - safe:    通常表示
 */
export type SafetyLevel = 'blocked' | 'caution' | 'safe';

/**
 * 安全カテゴリ
 * blocked_keyword_category と一致させる（管理画面との整合のため）
 */
export type SafetyCategory =
  | 'pharmaceutical'    // 医薬品・処方薬
  | 'weapon'            // 武器・刃物
  | 'counterfeit'       // 偽物疑い・ブランド模倣
  | 'adult'             // 成人向け・年齢制限
  | 'hazardous'         // 危険物・化学物質
  | 'surveillance'      // 盗聴・監視機器
  | 'gambling'          // ギャンブル関連
  | 'tobacco'           // タバコ・ニコチン関連
  | 'illegal'           // 違法品全般
  | 'food_supplement'   // 食品・サプリ（要注意）
  | 'baby'              // ベビー用品（要注意）
  | 'cosmetic'          // コスメ（要注意）
  | 'battery'           // 電源・バッテリー（要注意）
  | 'brand_luxury'      // 高額ブランド品（偽物リスク）
  | 'other';            // その他

/**
 * キーワードベースの安全ルール
 *
 * keywords 内のいずれかが title / shopCode に部分一致した場合に level を適用。
 * 将来は blocked_keywords テーブルのレコードと同等構造にする想定。
 */
export interface SafetyKeywordRule {
  id: string;
  /** 部分一致キーワード一覧（タイトル・ショップ名に対してチェック）*/
  keywords: string[];
  level: SafetyLevel;
  category: SafetyCategory;
  /** 表示用の理由（管理画面・通報フォームに表示）*/
  reason: string;
}

/**
 * 安全チェック済みの商品オファー
 */
export interface AnnotatedOffer {
  offer: ProductOffer;
  safetyLevel: SafetyLevel;
  /** level が 'caution' の場合の表示理由 */
  cautionReason?: string;
  /** マッチしたルール ID（デバッグ用）*/
  matchedRuleId?: string;
}

/**
 * filterProductOffers() の戻り値
 */
export interface SafetyFilterResult {
  /** 表示する商品（safe + caution）*/
  annotated: AnnotatedOffer[];
  /** blocked により非表示にした件数 */
  blockedCount: number;
  /** caution 件数 */
  cautionCount: number;
  /** フィルター前の合計件数 */
  totalInputCount: number;
}
