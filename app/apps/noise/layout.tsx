import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '作業用 BGM | MicroApps Hub',
  description: '雨音・カフェ・自然音で集中環境を作る。',
  openGraph: {
    title: '作業用 BGM | MicroApps Hub',
    description: '雨音・カフェ・自然音で集中環境を作る。',
    images: [
      {
        url: '/api/og/noise',
        width: 1200,
        height: 630,
        alt: '作業用 BGM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '作業用 BGM | MicroApps Hub',
    description: '雨音・カフェ・自然音で集中環境を作る。',
    images: ['/api/og/noise'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('noise');
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
