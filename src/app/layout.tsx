import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Touki Analyzer - 登記情報アナライザー",
  description: "不動産登記情報の構造化・可視化・分析を自動で行うWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
