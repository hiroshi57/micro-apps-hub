import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ポモドーロ | MicroApps Hub',
  description: '25分集中→5分休憩。生産性を科学的に高める。',
  openGraph: {
    title: 'ポモドーロ | MicroApps Hub',
    description: '25分集中→5分休憩。生産性を科学的に高める。',
    images: [
      {
        url: '/api/og/pomodoro',
        width: 1200,
        height: 630,
        alt: 'ポモドーロ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポモドーロ | MicroApps Hub',
    description: '25分集中→5分休憩。生産性を科学的に高める。',
    images: ['/api/og/pomodoro'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
