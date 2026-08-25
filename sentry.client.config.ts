// sentry.client.config.ts
// ブラウザ側の Sentry 初期化
// 環境変数 NEXT_PUBLIC_SENTRY_DSN を Vercel に設定してください
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // エラーサンプリングレート (本番: 1.0 = 全エラー捕捉)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Replay: ユーザーセッション録画（エラー時 100% / 通常 10%）
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // DSN 未設定時はサイレント
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV ?? 'development',
});
