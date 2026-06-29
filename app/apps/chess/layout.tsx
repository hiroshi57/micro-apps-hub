import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'チェス | MicroApps Hub',
  description: '国際チェス。AIとの対局で戦略を磨く。',
  openGraph: {
    title: 'チェス | MicroApps Hub',
    description: '国際チェス。AIとの対局で戦略を磨く。',
    images: [
      {
        url: '/api/og/chess',
        width: 1200,
        height: 630,
        alt: 'チェス',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'チェス | MicroApps Hub',
    description: '国際チェス。AIとの対局で戦略を磨く。',
    images: ['/api/og/chess'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
