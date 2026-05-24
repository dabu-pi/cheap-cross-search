import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site';

/**
 * Next.js App Router robots
 * /robots.txt として自動配信される
 *
 * 管理画面・認証系・API は検索エンジンに渡さない。
 * カスタムドメインに移行する場合は src/lib/config/site.ts の SITE_URL を変更するだけでよい。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/account',
          '/favorites',
          '/favorites/',
          '/history',
          '/auth/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
