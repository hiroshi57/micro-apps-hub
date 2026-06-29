import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '反応速度テスト | MicroApps Hub',
  description: '自分の反応速度を計測。運動神経を数値化。',
  openGraph: {
    title: '反応速度テスト | MicroApps Hub',
    description: '自分の反応速度を計測。運動神経を数値化。',
    images: [
      {
        url: '/api/og/reaction',
        width: 1200,
        height: 630,
        alt: '反応速度テスト',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '反応速度テスト | MicroApps Hub',
    description: '自分の反応速度を計測。運動神経を数値化。',
    images: ['/api/og/reaction'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
