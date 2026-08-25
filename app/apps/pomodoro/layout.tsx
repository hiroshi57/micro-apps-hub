import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'ポモドーロ | MicroApps Hub',
  description: '25分集中→5分休憩。生産性を科学的に高める。',
  openGraph: {
    title: 'ポモドーロ | MicroApps Hub',
    description: '25分集中→5分休憩。生産性を科学的に高める。',
    images: [
      {
        url: '/api/og/pomodoro',
        width: 1200,
        height: 630,
        alt: 'ポモドーロ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポモドーロ | MicroApps Hub',
    description: '25分集中→5分休憩。生産性を科学的に高める。',
    images: ['/api/og/pomodoro'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('pomodoro');
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
