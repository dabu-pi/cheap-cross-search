import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "安買い横断サーチ",
  description: "Amazon・SHEIN・AliExpress・Temuを1つの検索ワードで横断比較。価格・送料・到着予定を一覧表示。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "安買い横断サーチ",
  },
  openGraph: {
    title: "安買い横断サーチ",
    description: "Amazon・SHEIN・AliExpress・Temuを横断検索",
    type: "website",
    locale: "ja_JP",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
