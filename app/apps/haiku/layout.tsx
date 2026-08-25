import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '俳句ジェネレーター | MicroApps Hub',
  description: '無限生成・季語500+・テーマ指定',
  openGraph: {
    title: '俳句ジェネレーター | MicroApps Hub',
    images: [{ url: '/api/og/haiku', width: 1200, height: 630, alt: '俳句ジェネレーター' }],
  },
  twitter: { card: 'summary_large_image', title: '俳句ジェネレーター | MicroApps Hub', images: ['/api/og/haiku'] },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('haiku');
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
