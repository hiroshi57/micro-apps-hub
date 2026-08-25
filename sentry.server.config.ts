// sentry.server.config.ts
// サーバーサイド（Node.js / Route Handlers）の Sentry 初期化
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV ?? 'development',

  // Stripe Webhook / Supabase のエラーを捕捉して Slack/メールへ通知
  beforeSend(event) {
    // 開発環境ではコンソールにも出力
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Sentry Server]', event.exception?.values?.[0]?.value);
    }
    return event;
  },
});
