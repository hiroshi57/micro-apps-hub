import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: '単語帳メーカー | MicroApps Hub',
  description: 'カード無制限作成・デッキ管理・スペースド反復',
  openGraph: {
    title: '単語帳メーカー | MicroApps Hub',
    images: [{ url: '/api/og/flashcard', width: 1200, height: 630, alt: '単語帳メーカー' }],
  },
  twitter: { card: 'summary_large_image', title: '単語帳メーカー | MicroApps Hub', images: ['/api/og/flashcard'] },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('flashcard');
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
