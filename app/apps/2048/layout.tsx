import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '2048 | MicroApps Hub',
  description: 'スライドして数字を合わせる中毒パズル。',
  openGraph: {
    title: '2048 | MicroApps Hub',
    description: 'スライドして数字を合わせる中毒パズル。',
    images: [
      {
        url: '/api/og/2048',
        width: 1200,
        height: 630,
        alt: '2048',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2048 | MicroApps Hub',
    description: 'スライドして数字を合わせる中毒パズル。',
    images: ['/api/og/2048'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
