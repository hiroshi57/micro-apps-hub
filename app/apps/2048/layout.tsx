import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

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
  const app = getApp('2048');
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
