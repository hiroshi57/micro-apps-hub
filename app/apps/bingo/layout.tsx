import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'ビンゴカード | MicroApps Hub',
  description: '10枚同時・カスタム数字・QR共有',
  openGraph: {
    title: 'ビンゴカード | MicroApps Hub',
    images: [{ url: '/api/og/bingo', width: 1200, height: 630, alt: 'ビンゴカード' }],
  },
  twitter: { card: 'summary_large_image', title: 'ビンゴカード | MicroApps Hub', images: ['/api/og/bingo'] },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('bingo');
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
