import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'シニア向け脳トレ | MicroApps Hub',
  description: '大きな文字・わかりやすい操作の脳活アプリ。',
  openGraph: {
    title: 'シニア向け脳トレ | MicroApps Hub',
    description: '大きな文字・わかりやすい操作の脳活アプリ。',
    images: [
      {
        url: '/api/og/senior-brain',
        width: 1200,
        height: 630,
        alt: 'シニア向け脳トレ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'シニア向け脳トレ | MicroApps Hub',
    description: '大きな文字・わかりやすい操作の脳活アプリ。',
    images: ['/api/og/senior-brain'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
