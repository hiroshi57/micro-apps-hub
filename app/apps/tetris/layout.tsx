import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'テトリス | MicroApps Hub',
  description: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。',
  openGraph: {
    title: 'テトリス | MicroApps Hub',
    description: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。',
    images: [
      {
        url: '/api/og/tetris',
        width: 1200,
        height: 630,
        alt: 'テトリス',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'テトリス | MicroApps Hub',
    description: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。',
    images: ['/api/og/tetris'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('tetris');
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
