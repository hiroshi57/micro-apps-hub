import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'スネーク | MicroApps Hub',
  description: '成長するほど難しくなる古典ゲーム。',
  openGraph: {
    title: 'スネーク | MicroApps Hub',
    description: '成長するほど難しくなる古典ゲーム。',
    images: [
      {
        url: '/api/og/snake',
        width: 1200,
        height: 630,
        alt: 'スネーク',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スネーク | MicroApps Hub',
    description: '成長するほど難しくなる古典ゲーム。',
    images: ['/api/og/snake'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
