import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'オセロ | MicroApps Hub',
  description: 'リバーシで頭を使う。AI難易度5段階。',
  openGraph: {
    title: 'オセロ | MicroApps Hub',
    description: 'リバーシで頭を使う。AI難易度5段階。',
    images: [
      {
        url: '/api/og/othello',
        width: 1200,
        height: 630,
        alt: 'オセロ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'オセロ | MicroApps Hub',
    description: 'リバーシで頭を使う。AI難易度5段階。',
    images: ['/api/og/othello'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('othello');
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
