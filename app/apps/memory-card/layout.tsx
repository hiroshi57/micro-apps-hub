import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '記憶カード | MicroApps Hub',
  description: '短期記憶を鍛えるペア合わせゲーム。',
  openGraph: {
    title: '記憶カード | MicroApps Hub',
    description: '短期記憶を鍛えるペア合わせゲーム。',
    images: [
      {
        url: '/api/og/memory-card',
        width: 1200,
        height: 630,
        alt: '記憶カード',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '記憶カード | MicroApps Hub',
    description: '短期記憶を鍛えるペア合わせゲーム。',
    images: ['/api/og/memory-card'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('memory-card');
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
