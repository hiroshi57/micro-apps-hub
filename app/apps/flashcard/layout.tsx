import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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
  return <>{children}</>;
}
