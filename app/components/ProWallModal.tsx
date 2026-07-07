'use client';

/**
 * app/components/ProWallModal.tsx
 *
 * 全ゲーム共通のPro壁モーダル
 * フロー状態中に最適なタイミングで表示し、購買動機を最大化
 *
 * 使い方:
 *   <ProWallModal
 *     slug="tetris"
 *     price={480}
 *     proFeatures={['...', '...']}
 *     streak={streak}
 *     level={level}
 *     onClose={() => router.push('/')}
 *   />
 */

import Link from 'next/link';
import { CheckoutButton } from '@/app/components/CheckoutButton';

interface ProWallModalProps {
  slug: string;
  price: number;
  proFeatures: string[];
  streak?: number;
  level?: number;
  onClose?: () => void;
  /** ゲーム名 */
  title?: string;
  emoji?: string;
}

export function ProWallModal({
  slug,
  price,
  proFeatures,
  streak = 0,
  level = 1,
  onClose,
  title = 'このゲーム',
  emoji = '🎮',
}: ProWallModalProps) {
  // ストリーク状態で Pro壁のコピーを変更
  const isStreaking = streak >= 3;
  const isHighLevel = level >= 5;

  const headline = isStreaking
    ? `🔥 ${streak}連続！その集中力をPro版で`
    : isHighLevel
    ? `⬆️ レベル${level}到達！次のステージへ`
    : `🎯 本日の無料プレイ終了`;

  const subtext = isStreaking
    ? 'ゾーン状態のまま続けるとさらに上達できます'
    : isHighLevel
    ? '上位レベルのコンテンツはPro版で体験できます'
    : '明日また無料でプレイできます';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* 緊急度バッジ */}
        {isStreaking && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-1 rounded-full whitespace-nowrap">
            🔥 ストリーク中！今が購入の最適タイミング
          </div>
        )}

        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{headline}</h2>
          <p className="text-gray-400">{subtext}</p>
          <p className="text-gray-600 text-sm mt-1" lang="en">
            One-time Pro purchase unlocks everything — international cards accepted.
          </p>
        </div>

        {/* Pro 機能リスト */}
        <ul className="space-y-2 mb-8">
          {proFeatures.slice(0, 5).map((f) => (
            <li key={f} className="flex items-center gap-2 text-gray-300">
              <span className="text-pro-400 text-lg">★</span>
              <span>{f}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 text-gray-300">
            <span className="text-pro-400 text-lg">★</span>
            <span>永久利用・買い切り（サブスクなし）<span className="block text-xs text-gray-500" lang="en">Yours forever — one-time purchase, no subscription</span></span>
          </li>
        </ul>

        {/* CTA ボタン */}
        <div className="mb-3">
          <CheckoutButton
            appSlug={slug}
            price={price}
            className="w-full bg-gradient-to-r from-pro-600 to-pro-500 hover:from-pro-500 hover:to-pro-400 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-lg"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-400 transition-colors"
            >
              明日また来る / Come back tomorrow
            </button>
          )}
          <Link href="/" className="text-gray-600 hover:text-gray-400 transition-colors ml-auto">
            Hub に戻る →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==============================
// スコアポップアップ（正解・不正解演出）
// ==============================

interface ScorePopupProps {
  events: Array<{ type: string; message: string; xpBonus: number; emoji: string }>;
}

export function ScorePopup({ events }: ScorePopupProps) {
  if (events.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 pointer-events-none">
      {events.map((e, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-gray-800/90 backdrop-blur border border-white/10 rounded-full px-4 py-2 text-white text-sm font-bold animate-slide-in shadow-lg"
        >
          <span>{e.emoji}</span>
          <span>{e.message}</span>
          {e.xpBonus > 0 && (
            <span className="text-pro-400 ml-1">+{e.xpBonus} XP</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ==============================
// フロー状態インジケーター（ゲーム画面内）
// ==============================

interface FlowIndicatorProps {
  streak: number;
  level: number;
  xp: number;
  hookMessage: string;
}

export function FlowIndicator({ streak, level, xp, hookMessage }: FlowIndicatorProps) {
  const inZone = streak >= 5;

  return (
    <div className={`rounded-xl p-3 text-center transition-all ${
      inZone
        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
        : 'bg-white/5'
    }`}>
      <div className="flex items-center justify-center gap-3 mb-1">
        <span className="text-sm text-gray-400">Lv.{level}</span>
        <span className="text-sm font-bold text-white">{streak > 0 && `🔥 ${streak}連続`}</span>
        <span className="text-sm text-pro-400">{xp} XP</span>
      </div>
      <p className={`text-xs font-medium ${inZone ? 'text-yellow-300' : 'text-gray-500'}`}>
        {hookMessage}
      </p>
    </div>
  );
}
