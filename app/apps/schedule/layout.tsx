import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '時間割メーカー | MicroApps Hub',
  description: '学校・習い事の時間割を簡単作成。',
  openGraph: {
    title: '時間割メーカー | MicroApps Hub',
    description: '学校・習い事の時間割を簡単作成。',
    images: [
      {
        url: '/api/og/schedule',
        width: 1200,
        height: 630,
        alt: '時間割メーカー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '時間割メーカー | MicroApps Hub',
    description: '学校・習い事の時間割を簡単作成。',
    images: ['/api/og/schedule'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('schedule');
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
