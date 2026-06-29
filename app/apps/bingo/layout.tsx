import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ビンゴカード | MicroApps Hub',
  description: '10枚同時・カスタム数字・QR共有',
  openGraph: {
    title: 'ビンゴカード | MicroApps Hub',
    images: [{ url: '/api/og/bingo', width: 1200, height: 630, alt: 'ビンゴカード' }],
  },
  twitter: { card: 'summary_large_image', title: 'ビンゴカード | MicroApps Hub', images: ['/api/og/bingo'] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
