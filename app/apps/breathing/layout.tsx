import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '呼吸瞑想 | MicroApps Hub',
  description: '4-7-8呼吸法でストレスを解放。',
  openGraph: {
    title: '呼吸瞑想 | MicroApps Hub',
    description: '4-7-8呼吸法でストレスを解放。',
    images: [
      {
        url: '/api/og/breathing',
        width: 1200,
        height: 630,
        alt: '呼吸瞑想',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '呼吸瞑想 | MicroApps Hub',
    description: '4-7-8呼吸法でストレスを解放。',
    images: ['/api/og/breathing'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
