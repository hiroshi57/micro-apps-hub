import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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
  return <>{children}</>;
}
