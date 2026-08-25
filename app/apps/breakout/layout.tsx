import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'ブロック崩し | MicroApps Hub',
  description: 'ボールでブロックを消す爽快アクション。',
  openGraph: {
    title: 'ブロック崩し | MicroApps Hub',
    description: 'ボールでブロックを消す爽快アクション。',
    images: [
      {
        url: '/api/og/breakout',
        width: 1200,
        height: 630,
        alt: 'ブロック崩し',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ブロック崩し | MicroApps Hub',
    description: 'ボールでブロックを消す爽快アクション。',
    images: ['/api/og/breakout'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('breakout');
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
