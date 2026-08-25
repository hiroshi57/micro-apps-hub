/**
 * lib/rate-limit.ts  — T-065 Rate Limiting ユーティリティ
 *
 * Edge Runtime 対応のスライディングウィンドウ方式 IP ベースレートリミッター。
 * 外部サービス不要（Upstash/Redis なし）で動作する軽量実装。
 *
 * ⚠️ 注意: Edge/Serverless 環境では各リクエストが独立したインスタンスで
 *    実行される場合がある。本実装は同一インスタンス内での制限に有効だが、
 *    本番スケール時は @upstash/ratelimit + Vercel KV への移行を推奨。
 *
 * 設定:
 *   RATE_LIMIT_PREDICT  = 10  (req/min, デフォルト)
 *   RATE_LIMIT_LEARNING = 30  (req/min, デフォルト)
 *   RATE_LIMIT_DEFAULT  = 60  (req/min, デフォルト)
 */

export interface RateLimitResult {
  success: boolean;      // true = 通過, false = 制限超過
  limit: number;         // 上限
  remaining: number;     // 残り回数
  reset: number;         // リセット時刻 (Unix ms)
  retryAfter: number;    // 待機秒数 (successの場合は0)
}

interface WindowEntry {
  timestamps: number[];  // リクエスト到達時刻 (Unix ms)
}

// インスタンスローカルのスライディングウィンドウストア
const store = new Map<string, WindowEntry>();

/** 古いエントリを定期クリーンアップ（メモリリーク防止） */
function cleanup(windowMs: number) {
  const cutoff = Date.now() - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * スライディングウィンドウ方式でレートリミットを評価する。
 * @param key      識別子 (IP + path など)
 * @param limit    ウィンドウあたりの最大リクエスト数
 * @param windowMs ウィンドウ幅 (ms)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  // 100リクエストごとにクリーンアップ（軽量化）
  if (store.size > 1000) cleanup(windowMs);

  if (!store.has(key)) {
    store.set(key, { timestamps: [] });
  }
  const entry = store.get(key)!;

  // ウィンドウ外のタイムスタンプを削除
  entry.timestamps = entry.timestamps.filter(t => t > cutoff);

  const count = entry.timestamps.length;
  const reset = entry.timestamps.length > 0
    ? entry.timestamps[0] + windowMs
    : now + windowMs;

  if (count >= limit) {
    const retryAfter = Math.ceil((reset - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
      retryAfter: Math.max(retryAfter, 1),
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - count - 1,
    reset,
    retryAfter: 0,
  };
}

/** ルートごとの制限設定 */
export const ROUTE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/predict':  { limit: Number(process.env.RATE_LIMIT_PREDICT  ?? 10), windowMs: 60_000 },
  '/api/learning': { limit: Number(process.env.RATE_LIMIT_LEARNING ?? 30), windowMs: 60_000 },
  '/api/stripe':   { limit: Number(process.env.RATE_LIMIT_STRIPE   ?? 20), windowMs: 60_000 },
};

export const DEFAULT_LIMIT = {
  limit: Number(process.env.RATE_LIMIT_DEFAULT ?? 60),
  windowMs: 60_000,
};
