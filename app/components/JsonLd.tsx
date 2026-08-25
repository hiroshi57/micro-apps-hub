/**
 * JSON-LD 構造化データコンポーネント
 * SEO 向け SoftwareApplication スキーマ
 */

interface AppJsonLdProps {
  appTitle: string;
  appSlug: string;
  description: string;
  price: number;
  emoji: string;
  category: 'game' | 'tool' | 'wellness' | 'training';
}

const GENRE_MAP: Record<string, string> = {
  game: 'GameApplication',
  tool: 'UtilitiesApplication',
  wellness: 'HealthApplication',
  training: 'EducationalApplication',
};

export function AppJsonLd({ appTitle, appSlug, description, price, category }: AppJsonLdProps) {
  const siteUrl = 'https://micro-apps-hub-seven.vercel.app';
  const appType = GENRE_MAP[category] ?? 'WebApplication';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appTitle,
    description,
    applicationCategory: appType,
    operatingSystem: 'Web',
    url: `${siteUrl}/apps/${appSlug}`,
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Person',
      name: '滝澤 寛',
      email: 'hiroshi.takizawa@digitalidentity.co.jp',
    },
    provider: {
      '@type': 'Organization',
      name: 'MicroApps Hub',
      url: siteUrl,
    },
    inLanguage: 'ja',
    isAccessibleForFree: true,
    screenshot: `${siteUrl}/api/og/${appSlug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** トップページ用 WebSite スキーマ */
export function SiteJsonLd() {
  const siteUrl = 'https://micro-apps-hub-seven.vercel.app';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MicroApps Hub',
    description: 'テトリス・数独・将棋など28本のミニアプリ集。無料版で試して、気に入ったら買い切りProにアップグレード。',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    author: {
      '@type': 'Person',
      name: '滝澤 寛',
    },
    inLanguage: 'ja',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** FAQ ページ用 FAQPage スキーマ */
export function FaqJsonLd(props: { faqs: { q: string; a: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
