import { MetadataRoute } from 'next';
import { APPS } from '@/lib/apps-config';

const BASE = 'https://micro-apps-hub-seven.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/legal/tokusho`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const appPages: MetadataRoute.Sitemap = APPS.flatMap(app => [
    {
      url: `${BASE}/apps/${app.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE}/apps/${app.slug}/pro`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]);

  return [...staticPages, ...appPages];
}
