import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 将来の画像取得時に必要なドメインを追加する
  images: {
    remotePatterns: [
      // Amazon
      { protocol: 'https', hostname: '**.amazon.com' },
      { protocol: 'https', hostname: '**.amazon.co.jp' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      // SHEIN
      { protocol: 'https', hostname: '**.shein.com' },
      { protocol: 'https', hostname: '**.sheincorp.com' },
      // AliExpress
      { protocol: 'https', hostname: '**.aliexpress.com' },
      { protocol: 'https', hostname: '**.alicdn.com' },
      // Temu
      { protocol: 'https', hostname: '**.temu.com' },
      // 楽天市場（Phase 22）
      { protocol: 'https', hostname: 'thumbnail.image.rakuten.co.jp' },
      { protocol: 'https', hostname: '**.r10s.jp' },
      { protocol: 'https', hostname: '**.rakuten.co.jp' },
      // Yahoo!ショッピング（Phase 22）
      { protocol: 'https', hostname: 'item-shopping.c.yimg.jp' },
      { protocol: 'https', hostname: '**.yimg.jp' },
    ],
  },
};

export default nextConfig;
