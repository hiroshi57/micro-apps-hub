import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MicroApps Hub — 20本のミニアプリ集',
    template: '%s | MicroApps Hub',
  },
  description: 'テトリス・数独・将棋など20本のミニアプリ。無料版で試して、気に入ったら買い切りProにアップグレード。',
  keywords: ['テトリス', '数独', '将棋', 'ゲーム', 'パズル', '集中', '瞑想', 'ポモドーロ'],
  openGraph: {
    type: 'website',
    siteName: 'MicroApps Hub',
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
