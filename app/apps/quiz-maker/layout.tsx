import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppJsonLd } from '@/app/components/JsonLd';
import { getApp } from '@/lib/apps-config';

export const metadata: Metadata = {
  title: 'クイズ作成ツール | MicroApps Hub',
  description: 'クイズ無制限作成・記述式・正誤問題・URLシェア',
  openGraph: {
    title: 'クイズ作成ツール | MicroApps Hub',
    images: [{ url: '/api/og/quiz-maker', width: 1200, height: 630, alt: 'クイズ作成ツール' }],
  },
  twitter: { card: 'summary_large_image', title: 'クイズ作成ツール | MicroApps Hub', images: ['/api/og/quiz-maker'] },
};

export default function Layout({ children }: { children: ReactNode }) {
  const app = getApp('quiz-maker');
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
