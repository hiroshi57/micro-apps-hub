import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '色彩テスト | MicroApps Hub',
  description: '微妙な色の違いを判別できるか試す。',
  openGraph: {
    title: '色彩テスト | MicroApps Hub',
    description: '微妙な色の違いを判別できるか試す。',
    images: [
      {
        url: '/api/og/color-test',
        width: 1200,
        height: 630,
        alt: '色彩テスト',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '色彩テスト | MicroApps Hub',
    description: '微妙な色の違いを判別できるか試す。',
    images: ['/api/og/color-test'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
