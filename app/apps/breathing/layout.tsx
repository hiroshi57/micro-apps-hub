import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '呼吸瞑想 | MicroApps Hub',
  description: '4-7-8呼吸法でストレスを解放。',
  openGraph: {
    title: '呼吸瞑想 | MicroApps Hub',
    description: '4-7-8呼吸法でストレスを解放。',
    images: [
      {
        url: '/api/og/breathing',
        width: 1200,
        height: 630,
        alt: '呼吸瞑想',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '呼吸瞑想 | MicroApps Hub',
    description: '4-7-8呼吸法でストレスを解放。',
    images: ['/api/og/breathing'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('breathing');
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
