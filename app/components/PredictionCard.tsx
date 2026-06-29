'use client';

import { useEffect, useState } from 'react';
import { fetchPrediction, type PredictionResult } from '@/lib/learning';

interface Props {
  slug: string;
  /** 直近のスコア（ゲームページから渡す） */
  latestScore?: number;
}

/**
 * スコア予測カード
 * TimesFM（または線形回帰フォールバック）による今後7回分の予測を表示する。
 * 5回以上プレイ済みの場合のみ表示される。
 */
export function PredictionCard({ slug, latestScore }: Props) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction(slug)
      .then(setPrediction)
      .finally(() => setLoading(false));
  }, [slug, latestScore]); // latestScore が変わったら再取得

  if (loading) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 animate-pulse">
        <div className="h-3 bg-white/10 rounded w-24 mb-2" />
        <div className="h-2 bg-white/10 rounded w-40" />
      </div>
    );
  }

  if (!prediction) return null; // 5回未満は非表示

  const trendIcon  = prediction.trend === 'up'   ? '📈' :
                     prediction.trend === 'down'  ? '📉' : '➡️';
  const trendColor = prediction.trend === 'up'   ? 'text-emerald-400' :
                     prediction.trend === 'down'  ? 'text-rose-400'    : 'text-gray-400';
  const trendLabel = prediction.trend === 'up'   ? '上昇中' :
                     prediction.trend === 'down'  ? '下降中'  : '横ばい';

  const confidencePct = Math.round(prediction.confidence * 100);
  const nextScore     = prediction.forecast[0] ?? 0;
  const modelLabel    = prediction.model === 'timesfm' ? 'TimesFM AI' : 'AI予測';

  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 p-4 text-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-indigo-300">🔮 スコア予測</span>
          <span className="text-[10px] text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
            {modelLabel}
          </span>
        </div>
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendIcon} {trendLabel}
        </span>
      </div>

      {/* 予測グラフ（ミニバーチャート） */}
      <div className="flex items-end gap-1 mb-3 h-10">
        {prediction.forecast.map((score, i) => {
          const height = `${Math.max(10, score)}%`;
          const opacity = 0.4 + (i / prediction.forecast.length) * 0.6;
          return (
            <div
              key={i}
              className="flex-1 rounded-t bg-indigo-400 transition-all"
              style={{ height, opacity }}
              title={`${i + 1}回後: ${score}点`}
            />
          );
        })}
      </div>

      {/* 数値サマリ */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          次回予測: <span className="text-white font-bold">{nextScore}点</span>
        </span>
        {prediction.reachGoalIn && (
          <span>
            80点まで: <span className="text-emerald-400 font-bold">あと{prediction.reachGoalIn}回</span>
          </span>
        )}
        <span className="text-gray-600">信頼度 {confidencePct}%</span>
      </div>
    </div>
  );
}
