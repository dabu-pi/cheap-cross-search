/**
 * サイト共通設定
 *
 * カスタムドメインに変更する場合はここの SITE_URL を変更するだけでよい。
 * sitemap / robots / OGP metadataBase がすべてここを参照する。
 */

/** 本番サイトの基底 URL（末尾スラッシュなし） */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://cheap-cross-search.vercel.app';

/** サービス正式名称 */
export const SITE_NAME = 'ECサイト比較.com';

/** サービス概要（description 用） */
export const SITE_DESCRIPTION =
  'Amazon・SHEIN・AliExpress・Temuを1つの検索ワードで横断比較。価格・送料・到着予定を一覧表示。最安値を探せる無料EC比較サービス。';
