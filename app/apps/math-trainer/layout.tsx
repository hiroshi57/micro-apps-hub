import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '計算力トレーナー | MicroApps Hub',
  description: '暗算スピードを上げる脳トレ。',
  openGraph: {
    title: '計算力トレーナー | MicroApps Hub',
    description: '暗算スピードを上げる脳トレ。',
    images: [
      {
        url: '/api/og/math-trainer',
        width: 1200,
        height: 630,
        alt: '計算力トレーナー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '計算力トレーナー | MicroApps Hub',
    description: '暗算スピードを上げる脳トレ。',
    images: ['/api/og/math-trainer'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('math-trainer');
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
