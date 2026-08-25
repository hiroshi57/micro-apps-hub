import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

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
  const app = getApp('minesweeper');
  if (!app) return <>{children}</>;
  return (
    <>
      <AppJsonLd
        appTitle={app.title}
        appSlug={app.slug}
        description={app.description}
        price={app.price}
        emoji={app.emoji}
        category={app.category}
      />
      {children}
    </>
  );
}
