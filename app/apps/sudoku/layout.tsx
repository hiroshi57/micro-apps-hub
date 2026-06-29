import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '数独 | MicroApps Hub',
  description: '頭を使う数字パズル。難易度地獄まで完全対応。',
  openGraph: {
    title: '数独 | MicroApps Hub',
    description: '頭を使う数字パズル。難易度地獄まで完全対応。',
    images: [
      {
        url: '/api/og/sudoku',
        width: 1200,
        height: 630,
        alt: '数独',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '数独 | MicroApps Hub',
    description: '頭を使う数字パズル。難易度地獄まで完全対応。',
    images: ['/api/og/sudoku'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
