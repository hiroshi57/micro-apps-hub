import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'テトリス | MicroApps Hub',
  description: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。',
  openGraph: {
    title: 'テトリス | MicroApps Hub',
    description: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。',
    images: [
      {
        url: '/api/og/tetris',
        width: 1200,
        height: 630,
        alt: 'テトリス',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'テトリス | MicroApps Hub',
    description: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。',
    images: ['/api/og/tetris'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
