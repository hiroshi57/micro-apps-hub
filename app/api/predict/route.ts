/**
 * app/api/predict/route.ts
 *
 * スコア予測 API エンドポイント
 *
 * TimesFM 統合パス:
 *   1. Google TimesFM (https://github.com/google-research/timesfm)
 *      を Python FastAPI サービスとして deploy
 *   2. 本エンドポイントが TIMESFM_API_URL へ転送
 *   3. 未設定時は Node.js 線形回帰フォールバック
 *
 * TimesFM セットアップ例:
 *   git clone https://github.com/google-research/timesfm.git
 *   cd timesfm && pip install -e ".[pax]"
 *   python scripts/serve_api.py --port 8080  # カスタムAPIサーバー
 *
 * 環境変数:
 *   TIMESFM_API_URL=http://localhost:8080  (optional)
 */

import { NextRequest, NextResponse } from 'next/server';

interface PredictRequest {
  slug: string;
  scores: number[];       // 過去のスコア時系列
  timestamps: string[];   // ISO8601
}

interface PredictResponse {
  forecast: number[];
  trend: 'up' | 'down' | 'flat';
  confidence: number;
  reachGoalIn?: number;
  model: 'timesfm' | 'linear';
}

export async function POST(req: NextRequest): Promise<NextResponse<PredictResponse | { error: string }>> {
  try {
    const body: PredictRequest = await req.json();
    const { scores } = body;

    if (!scores || scores.length < 3) {
      return NextResponse.json({ error: 'scores must have at least 3 data points' }, { status: 400 });
    }

    // TimesFM API が設定されている場合は転送
    const timesfmUrl = process.env.TIMESFM_API_URL;
    if (timesfmUrl) {
      try {
        const res = await fetch(`${timesfmUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: scores,
            freq: 0,          // irregular time series
            horizon: 7,       // 7ステップ先を予測
            num_samples: 20,  // 不確実性推定
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const data = await res.json();
          // TimesFM レスポンスを変換
          const forecast: number[] = (data.point_forecast ?? data.forecast ?? []).map(
            (v: number) => Math.min(100, Math.max(0, Math.round(v)))
          );
          return NextResponse.json(buildResponse(scores, forecast, 'timesfm'));
        }
      } catch {
        // TimesFM が応答しない場合はフォールバック
        console.warn('[predict] TimesFM unavailable, using linear fallback');
      }
    }

    // フォールバック: 加重線形回帰（最近のデータを重視）
    const forecast = weightedLinearForecast(scores, 7);
    return NextResponse.json(buildResponse(scores, forecast, 'linear'));
  } catch (e) {
    console.error('[predict] error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

// ==============================
// 加重線形回帰
// ==============================

function weightedLinearForecast(scores: number[], horizon: number): number[] {
  const n = scores.length;
  // 最近のデータほど重みを大きく
  const weights = scores.map((_, i) => 1 + (i / n) * 2);
  const totalW = weights.reduce((a, b) => a + b, 0);

  const meanX = weights.reduce((acc, w, i) => acc + w * i, 0) / totalW;
  const meanY = weights.reduce((acc, w, i) => acc + w * scores[i], 0) / totalW;

  const slope =
    weights.reduce((acc, w, i) => acc + w * (i - meanX) * (scores[i] - meanY), 0) /
    weights.reduce((acc, w, i) => acc + w * (i - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;

  return Array.from({ length: horizon }, (_, j) =>
    Math.min(100, Math.max(0, Math.round(intercept + slope * (n + j))))
  );
}

function buildResponse(
  scores: number[],
  forecast: number[],
  model: 'timesfm' | 'linear'
): PredictResponse {
  const recent = scores.slice(-5);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const forecastAvg = forecast.reduce((a, b) => a + b, 0) / forecast.length;

  const trend: PredictResponse['trend'] =
    forecastAvg > recentAvg + 3 ? 'up' :
    forecastAvg < recentAvg - 3 ? 'down' : 'flat';

  // 目標スコア80到達予測
  const slope = (forecastAvg - recentAvg) / forecast.length;
  const reachGoalIn = slope > 0 && recentAvg < 80
    ? Math.ceil((80 - recentAvg) / slope)
    : undefined;

  // 信頼度: データ量が多いほど高い（最大0.95）
  const confidence = Math.min(0.95, 0.5 + scores.length * 0.015);

  return { forecast, trend, confidence, reachGoalIn, model };
}
