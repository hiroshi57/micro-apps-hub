import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://micro-apps-hub-seven.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'MicroApps Hub — 28本のミニアプリ集',
    template: '%s | MicroApps Hub',
  },
  description: 'テトリス・数独・将棋など28本のミニアプリ。無料版で試して、気に入ったら買い切りProにアップグレード。',
  keywords: ['テトリス', '数独', '将棋', 'ゲーム', 'パズル', '集中', '瞑想', 'ポモドーロ'],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    siteName: 'MicroApps Hub',
    images: [
      {
        url: '/api/og/tetris',   // デフォルト OG 画像 (テトリスカード)
        width: 1200,
        height: 630,
        alt: 'MicroApps Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${SITE_URL}/api/og/tetris`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className="min-h-screen bg-gray-950">
        {children}
      </body>
    </html>
  );
}
