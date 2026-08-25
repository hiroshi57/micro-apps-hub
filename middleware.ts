/**
 * middleware.ts  — T-065 Rate Limiting Middleware
 *
 * Next.js Edge Middleware として動作。
 * /api/* へのリクエストをインターセプトし、IP ベースでレートリミットを適用する。
 *
 * レスポンスヘッダー:
 *   X-RateLimit-Limit     — ウィンドウあたりの上限
 *   X-RateLimit-Remaining — 残り回数
 *   X-RateLimit-Reset     — リセット時刻 (Unix sec)
 *   Retry-After           — 制限時の待機秒数 (429 のみ)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, ROUTE_LIMITS, DEFAULT_LIMIT } from '@/lib/rate-limit';

export const config = {
  matcher: ['/api/predict/:path*', '/api/learning/:path*', '/api/stripe/:path*'],
};

/** リクエスト元 IP を取得（Vercel / プロキシ対応） */
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** パスのプレフィックスにマッチするルート設定を探す */
function getRouteConfig(pathname: string) {
  for (const [route, cfg] of Object.entries(ROUTE_LIMITS)) {
    if (pathname.startsWith(route)) return cfg;
  }
  return DEFAULT_LIMIT;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIP(req);
  const { limit, windowMs } = getRouteConfig(pathname);
  const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`;

  const result = checkRateLimit(key, limit, windowMs);

  const headers = new Headers();
  headers.set('X-RateLimit-Limit',     String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset',     String(Math.ceil(result.reset / 1000)));

  if (!result.success) {
    headers.set('Retry-After', String(result.retryAfter));
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `リクエスト制限 (${limit}回/分) に達しました。${result.retryAfter}秒後に再試行してください。`,
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers),
        },
      }
    );
  }

  // 通過 → ヘッダーを付与してそのままルートへ
  const res = NextResponse.next();
  headers.forEach((value, key) => res.headers.set(key, value));
  return res;
}
