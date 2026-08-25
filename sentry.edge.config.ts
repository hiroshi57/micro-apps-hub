// sentry.edge.config.ts
// Edge Runtime (middleware 等) の Sentry 初期化
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
