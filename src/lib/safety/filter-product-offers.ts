/**
 * 安全フィルター実装 (Phase 7)
 *
 * 商品表示前に安全ルールを適用し、blocked / caution / safe に分類する。
 *
 * - blocked → 表示しない
 * - caution → 注意ラベル付きで表示
 * - safe    → 通常表示
 *
 * 将来の移行先: Supabase blocked_keywords テーブル + server-side フィルター
 */

import type { ProductOffer } from '@/lib/search/adapters/types';
import type { SafetyKeywordRule, SafetyLevel, AnnotatedOffer, SafetyFilterResult } from './types';
import { ALL_SAFETY_RULES, BLOCKED_RULES, CAUTION_RULES } from './rules';

/**
 * 1件のオファーに対して安全チェックを実行する。
 */
export function checkOfferSafety(
  offer: ProductOffer,
  blockedRules: SafetyKeywordRule[] = BLOCKED_RULES,
  cautionRules: SafetyKeywordRule[] = CAUTION_RULES,
): { level: SafetyLevel; reason?: string; ruleId?: string } {
  // チェック対象テキスト（タイトルをメインに使用）
  const titleLower = (offer.title ?? '').toLowerCase();

  // ── blocked チェック（1件でもマッチしたら即 blocked）────────────
  for (const rule of blockedRules) {
    for (const kw of rule.keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        return { level: 'blocked', reason: rule.reason, ruleId: rule.id };
      }
    }
  }

  // ── caution チェック（最初にマッチしたルールを採用）──────────────
  for (const rule of cautionRules) {
    for (const kw of rule.keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        return { level: 'caution', reason: rule.reason, ruleId: rule.id };
      }
    }
  }

  return { level: 'safe' };
}

/**
 * 商品オファー一覧に安全フィルターを適用する。
 *
 * @param offers - 全商品オファー
 * @returns SafetyFilterResult — 表示用アノテーション済みオファーと統計
 */
export function filterProductOffers(
  offers: ProductOffer[],
  rules: SafetyKeywordRule[] = ALL_SAFETY_RULES,
): SafetyFilterResult {
  const blockedRules = rules.filter((r) => r.level === 'blocked');
  const cautionRules = rules.filter((r) => r.level === 'caution');

  const annotated: AnnotatedOffer[] = [];
  let blockedCount = 0;
  let cautionCount = 0;

  for (const offer of offers) {
    const { level, reason, ruleId } = checkOfferSafety(offer, blockedRules, cautionRules);

    if (level === 'blocked') {
      blockedCount++;
      // blocked は annotated に含めない（表示しない）
    } else {
      annotated.push({
        offer,
        safetyLevel: level,
        cautionReason: level === 'caution' ? reason : undefined,
        matchedRuleId: ruleId,
      });
      if (level === 'caution') cautionCount++;
    }
  }

  return {
    annotated,
    blockedCount,
    cautionCount,
    totalInputCount: offers.length,
  };
}

/**
 * filterProductOffers の軽量ラッパー — safe+caution の ProductOffer[] だけ返す。
 * UI が AnnotatedOffer を気にしない場合に使う。
 */
export function getDisplayableOffers(offers: ProductOffer[]): ProductOffer[] {
  return filterProductOffers(offers).annotated.map((a) => a.offer);
}
