import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'スライドパズル | MicroApps Hub',
  description: 'バラバラのピースを正しい順に並べ替え。',
  openGraph: {
    title: 'スライドパズル | MicroApps Hub',
    description: 'バラバラのピースを正しい順に並べ替え。',
    images: [
      {
        url: '/api/og/slide-puzzle',
        width: 1200,
        height: 630,
        alt: 'スライドパズル',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スライドパズル | MicroApps Hub',
    description: 'バラバラのピースを正しい順に並べ替え。',
    images: ['/api/og/slide-puzzle'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('slide-puzzle');
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
