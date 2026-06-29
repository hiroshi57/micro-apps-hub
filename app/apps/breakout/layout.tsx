import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ブロック崩し | MicroApps Hub',
  description: 'ボールでブロックを消す爽快アクション。',
  openGraph: {
    title: 'ブロック崩し | MicroApps Hub',
    description: 'ボールでブロックを消す爽快アクション。',
    images: [
      {
        url: '/api/og/breakout',
        width: 1200,
        height: 630,
        alt: 'ブロック崩し',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ブロック崩し | MicroApps Hub',
    description: 'ボールでブロックを消す爽快アクション。',
    images: ['/api/og/breakout'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
