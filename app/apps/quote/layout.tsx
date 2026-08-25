import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '名言ジェネレーター | MicroApps Hub',
  description: '偉人の言葉でモチベーションを上げる。',
  openGraph: {
    title: '名言ジェネレーター | MicroApps Hub',
    description: '偉人の言葉でモチベーションを上げる。',
    images: [
      {
        url: '/api/og/quote',
        width: 1200,
        height: 630,
        alt: '名言ジェネレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '名言ジェネレーター | MicroApps Hub',
    description: '偉人の言葉でモチベーションを上げる。',
    images: ['/api/og/quote'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('quote');
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
