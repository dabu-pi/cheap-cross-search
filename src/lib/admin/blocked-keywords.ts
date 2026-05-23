/**
 * 除外キーワードデモデータ (Phase 4)
 *
 * 本番 Supabase 接続後は blocked_keywords テーブルに移行する想定。
 * match_type: exact / partial / regex
 */

import type { BlockedKeyword } from './types';

export function getDemoBlockedKeywords(): BlockedKeyword[] {
  const now = new Date().toISOString();
  return [
    // 医薬品系
    { id: 'bk-001', keyword: '処方箋', matchType: 'partial', category: 'pharmaceutical', reason: '処方薬関連商品を除外', enabled: true, createdAt: now },
    { id: 'bk-002', keyword: '睡眠薬', matchType: 'partial', category: 'pharmaceutical', reason: '向精神薬関連を除外', enabled: true, createdAt: now },
    { id: 'bk-003', keyword: 'ステロイド', matchType: 'partial', category: 'pharmaceutical', reason: '医薬品ステロイドを除外（サプリ系は個別判断）', enabled: true, createdAt: now },
    // 武器系
    { id: 'bk-004', keyword: '実銃', matchType: 'partial', category: 'weapon', reason: '銃器関連を除外', enabled: true, createdAt: now },
    { id: 'bk-005', keyword: 'モデルガン', matchType: 'exact', category: 'weapon', reason: '法規制対象外だが念のため確認対象', enabled: false, createdAt: now },
    { id: 'bk-006', keyword: '模造刀', matchType: 'exact', category: 'weapon', reason: '販売規制確認中', enabled: false, createdAt: now },
    // 偽物疑い
    { id: 'bk-007', keyword: 'スーパーコピー', matchType: 'partial', category: 'counterfeit', reason: '商標権侵害品の可能性', enabled: true, createdAt: now },
    { id: 'bk-008', keyword: '激安ブランド', matchType: 'partial', category: 'counterfeit', reason: '偽ブランド品の可能性', enabled: true, createdAt: now },
    { id: 'bk-009', keyword: 'ロレックスコピー', matchType: 'partial', category: 'counterfeit', reason: '商標権侵害品', enabled: true, createdAt: now },
    // 成人向け
    { id: 'bk-010', keyword: '成人向け', matchType: 'partial', category: 'adult', reason: '18歳未満ユーザーへの不適切表示防止', enabled: true, createdAt: now },
    // 危険物
    { id: 'bk-011', keyword: '爆竹', matchType: 'partial', category: 'hazardous', reason: '火薬類取締法対象の可能性', enabled: true, createdAt: now },
    { id: 'bk-012', keyword: '発煙筒', matchType: 'exact', category: 'hazardous', reason: '危険物扱いの可能性', enabled: true, createdAt: now },
    // 盗聴・監視系
    { id: 'bk-013', keyword: '盗聴器', matchType: 'partial', category: 'surveillance', reason: '不正競争防止法・電波法抵触の可能性', enabled: true, createdAt: now },
    { id: 'bk-014', keyword: '隠しカメラ', matchType: 'partial', category: 'surveillance', reason: '不法盗撮目的の可能性', enabled: true, createdAt: now },
    { id: 'bk-015', keyword: 'GPS追跡', matchType: 'partial', category: 'surveillance', reason: 'ストーカー目的利用の防止', enabled: true, createdAt: now },
  ];
}

/** カテゴリ表示ラベル */
export const BLOCKED_KEYWORD_CATEGORY_LABELS: Record<string, string> = {
  pharmaceutical: '医薬品系',
  weapon: '武器・刃物系',
  counterfeit: '偽物疑い',
  adult: '成人向け',
  hazardous: '危険物',
  surveillance: '盗聴・監視系',
  other: 'その他',
};

/** match type 表示ラベル */
export const BLOCKED_KEYWORD_MATCH_TYPE_LABELS: Record<string, string> = {
  exact: '完全一致',
  partial: '部分一致',
  regex: '正規表現',
};
