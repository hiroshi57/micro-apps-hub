import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '将棋 | MicroApps Hub',
  description: '日本将棋。AI対局で棋力アップ。',
  openGraph: {
    title: '将棋 | MicroApps Hub',
    description: '日本将棋。AI対局で棋力アップ。',
    images: [
      {
        url: '/api/og/shogi',
        width: 1200,
        height: 630,
        alt: '将棋',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '将棋 | MicroApps Hub',
    description: '日本将棋。AI対局で棋力アップ。',
    images: ['/api/og/shogi'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
