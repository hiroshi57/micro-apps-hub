import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '将棋 | MicroApps Hub',
  description: '日本将棋。AI対局で棋力アップ。',
  openGraph: {
    title: '将棋 | MicroApps Hub',
    description: '日本将棋。AI対局で棋力アップ。',
    images: [
      {
        url: '/api/og/shogi',
        width: 1200,
        height: 630,
        alt: '将棋',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '将棋 | MicroApps Hub',
    description: '日本将棋。AI対局で棋力アップ。',
    images: ['/api/og/shogi'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('shogi');
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
