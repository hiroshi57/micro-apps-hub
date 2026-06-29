import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '時間割メーカー | MicroApps Hub',
  description: '学校・習い事の時間割を簡単作成。',
  openGraph: {
    title: '時間割メーカー | MicroApps Hub',
    description: '学校・習い事の時間割を簡単作成。',
    images: [
      {
        url: '/api/og/schedule',
        width: 1200,
        height: 630,
        alt: '時間割メーカー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '時間割メーカー | MicroApps Hub',
    description: '学校・習い事の時間割を簡単作成。',
    images: ['/api/og/schedule'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
