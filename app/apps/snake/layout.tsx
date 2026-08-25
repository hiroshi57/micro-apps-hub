import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'スネーク | MicroApps Hub',
  description: '成長するほど難しくなる古典ゲーム。',
  openGraph: {
    title: 'スネーク | MicroApps Hub',
    description: '成長するほど難しくなる古典ゲーム。',
    images: [
      {
        url: '/api/og/snake',
        width: 1200,
        height: 630,
        alt: 'スネーク',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スネーク | MicroApps Hub',
    description: '成長するほど難しくなる古典ゲーム。',
    images: ['/api/og/snake'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('snake');
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
