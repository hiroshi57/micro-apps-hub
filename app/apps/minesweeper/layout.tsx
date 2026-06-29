import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'マインスイーパー | MicroApps Hub',
  description: '地雷を避けて全マスを開放。タイムアタックで腕試し。',
  openGraph: {
    title: 'マインスイーパー | MicroApps Hub',
    description: '地雷を避けて全マスを開放。タイムアタックで腕試し。',
    images: [
      {
        url: '/api/og/minesweeper',
        width: 1200,
        height: 630,
        alt: 'マインスイーパー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'マインスイーパー | MicroApps Hub',
    description: '地雷を避けて全マスを開放。タイムアタックで腕試し。',
    images: ['/api/og/minesweeper'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
