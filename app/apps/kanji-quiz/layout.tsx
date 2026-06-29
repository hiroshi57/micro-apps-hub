import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '漢字クイズ | MicroApps Hub',
  description: '読み・書きの確認から難漢字まで。',
  openGraph: {
    title: '漢字クイズ | MicroApps Hub',
    description: '読み・書きの確認から難漢字まで。',
    images: [
      {
        url: '/api/og/kanji-quiz',
        width: 1200,
        height: 630,
        alt: '漢字クイズ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '漢字クイズ | MicroApps Hub',
    description: '読み・書きの確認から難漢字まで。',
    images: ['/api/og/kanji-quiz'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
