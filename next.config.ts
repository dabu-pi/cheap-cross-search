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
    ],
  },
};

export default nextConfig;
