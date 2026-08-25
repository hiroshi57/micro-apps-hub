import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'カラーパレット | MicroApps Hub',
  description: 'デザイン用の色をすぐ生成。HEX/RGB対応。',
  openGraph: {
    title: 'カラーパレット | MicroApps Hub',
    description: 'デザイン用の色をすぐ生成。HEX/RGB対応。',
    images: [
      {
        url: '/api/og/color-palette',
        width: 1200,
        height: 630,
        alt: 'カラーパレット',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'カラーパレット | MicroApps Hub',
    description: 'デザイン用の色をすぐ生成。HEX/RGB対応。',
    images: ['/api/og/color-palette'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('color-palette');
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
