import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'じゃんけん AI | MicroApps Hub',
  description: 'AIと戦略じゃんけん。読み合いで勝て。',
  openGraph: {
    title: 'じゃんけん AI | MicroApps Hub',
    description: 'AIと戦略じゃんけん。読み合いで勝て。',
    images: [
      {
        url: '/api/og/rock-paper-scissors',
        width: 1200,
        height: 630,
        alt: 'じゃんけん AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'じゃんけん AI | MicroApps Hub',
    description: 'AIと戦略じゃんけん。読み合いで勝て。',
    images: ['/api/og/rock-paper-scissors'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('rock-paper-scissors');
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
