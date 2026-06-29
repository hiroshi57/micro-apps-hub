import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'タイピング練習 | MicroApps Hub',
  description: '日本語・英語のタイピングスキルを上げる。',
  openGraph: {
    title: 'タイピング練習 | MicroApps Hub',
    description: '日本語・英語のタイピングスキルを上げる。',
    images: [
      {
        url: '/api/og/typing',
        width: 1200,
        height: 630,
        alt: 'タイピング練習',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'タイピング練習 | MicroApps Hub',
    description: '日本語・英語のタイピングスキルを上げる。',
    images: ['/api/og/typing'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
