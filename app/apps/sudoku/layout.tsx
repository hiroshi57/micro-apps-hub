import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '数独 | MicroApps Hub',
  description: '頭を使う数字パズル。難易度地獄まで完全対応。',
  openGraph: {
    title: '数独 | MicroApps Hub',
    description: '頭を使う数字パズル。難易度地獄まで完全対応。',
    images: [
      {
        url: '/api/og/sudoku',
        width: 1200,
        height: 630,
        alt: '数独',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '数独 | MicroApps Hub',
    description: '頭を使う数字パズル。難易度地獄まで完全対応。',
    images: ['/api/og/sudoku'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('sudoku');
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
