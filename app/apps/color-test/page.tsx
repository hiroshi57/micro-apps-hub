'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { FreemiumGate, GAME_FREEMIUM_CONFIGS } from '@/lib/freemium-gate';
import { FlowEngine, type RewardEvent } from '@/lib/flow-engine';
import { ProWallModal, ScorePopup, FlowIndicator } from '@/app/components/ProWallModal';
import { recordGameResult } from '@/lib/learning';

// ============================================================
// 色彩テスト — 微妙に違う色を1つ見つける
// ============================================================

interface ColorPatch {
  color: string;
  isOdd: boolean;
}

function hslToString(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateRound(level: number): { patches: ColorPatch[]; gridSize: number } {
  const gridSize = Math.min(3 + Math.floor(level / 3), 6); // 3x3 〜 6x6
  const total = gridSize * gridSize;

  const hue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.floor(Math.random() * 30);
  const lit = 40 + Math.floor(Math.random() * 20);

  // 難易度が上がるほど色差が小さくなる
  const diff = Math.max(3, 30 - level * 2.5);
  const baseColor = hslToString(hue, sat, lit);
  const oddColor = hslToString(hue, sat, lit + diff);

  const oddIndex = Math.floor(Math.random() * total);

  const patches: ColorPatch[] = Array.from({ length: total }, (_, i) => ({
    color: i === oddIndex ? oddColor : baseColor,
    isOdd: i === oddIndex,
  }));

  return { patches, gridSize };
}

export default function ColorTestPage() {
  const [round, setRound] = useState(generateRound(1));
  const [phase, setPhase] = useState<'playing' | 'correct' | 'wrong' | 'prowall'>('playing');
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);
  const [flowState, setFlowState] = useState({ streak: 0, level: 1, xp: 0, hookMsg: '' });
  const [showProWall, setShowProWall] = useState(false);

  const flowRef = useCallback(() => new FlowEngine('color-test'), []);
  const gateRef = useCallback(() => {
    const cfg = GAME_FREEMIUM_CONFIGS['color-test'];
    return new FreemiumGate({ slug: 'color-test', ...cfg });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const flowEngine = useCallback(flowRef, [])();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gate = useCallback(gateRef, [])();

  useEffect(() => {
    const s = flowEngine.state;
    setFlowState({ streak: s.streak, level: s.level, xp: s.xp, hookMsg: flowEngine.getHookMessage() });
    if (!gate.canPlay()) setShowProWall(true);
  }, [flowEngine, gate]);

  const handlePick = (patch: ColorPatch) => {
    if (phase !== 'playing') return;

    const isCorrect = patch.isOdd;
    const newTotal = total + 1;
    setTotal(newTotal);

    if (isCorrect) {
      const events = flowEngine.onCorrect();
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setScore(s => s + Math.round(100 / round.gridSize));
      setPhase('correct');
      if (events.length) { setRewardEvents(events); setTimeout(() => setRewardEvents([]), 2500); }
    } else {
      flowEngine.onWrong();
      setPhase('wrong');
    }

    const fs = flowEngine.state;
    setFlowState({ streak: fs.streak, level: fs.level, xp: fs.xp, hookMsg: flowEngine.getHookMessage() });

    recordGameResult({ slug: 'color-test', score: isCorrect ? 100 : 0, level: fs.level, duration: 0 });
    gate.recordPlay();

    setTimeout(() => {
      if (!gate.canPlay()) {
        setShowProWall(true);
        return;
      }
      const nextLevel = flowEngine.adjustDifficulty().nextLevel;
      setRound(generateRound(nextLevel));
      setPhase('playing');
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <ScorePopup events={rewardEvents} />
      {showProWall && (
        <ProWallModal
          slug="color-test"
          price={480}
          title="色彩テスト"
          emoji="🎨"
          proFeatures={['10種類のカラーテスト', '色覚特性レポート', '詳細解析グラフ', 'PDF ダウンロード']}
          streak={flowState.streak}
          level={flowState.level}
        />
      )}

      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🎨 色彩テスト</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版</span>
      </div>

      {/* スコア */}
      <div className="flex gap-4 mb-8">
        {[
          { label: 'スコア', value: score },
          { label: '正解', value: `${correct}/${total}` },
          { label: '残り', value: gate.remaining() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-800/60 rounded-2xl px-5 py-3 text-center min-w-[90px]">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-xl">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-400 mb-6 text-center">
        微妙に違う色のマスを見つけてください
      </p>

      {/* カラーグリッド */}
      <div
        className="mb-8"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${round.gridSize}, 1fr)`,
          gap: '8px',
          width: `${round.gridSize * 70}px`,
        }}
      >
        {round.patches.map((patch, i) => (
          <button
            key={i}
            onClick={() => handlePick(patch)}
            className="rounded-xl transition-all active:scale-95 focus:outline-none"
            style={{
              backgroundColor: patch.color,
              width: '64px',
              height: '64px',
              border: phase === 'correct' && patch.isOdd
                ? '3px solid #22c55e'
                : phase === 'wrong' && patch.isOdd
                ? '3px solid #ef4444'
                : '3px solid transparent',
            }}
          />
        ))}
      </div>

      {/* フィードバック */}
      {phase === 'correct' && (
        <p className="text-green-400 text-xl font-bold animate-bounce-once">⭕ 正解！</p>
      )}
      {phase === 'wrong' && (
        <p className="text-red-400 text-xl font-bold">❌ 惜しい！</p>
      )}

      {/* フロー状態 */}
      <div className="w-full max-w-xs mt-6">
        <FlowIndicator
          streak={flowState.streak}
          level={flowState.level}
          xp={flowState.xp}
          hookMessage={flowState.hookMsg}
        />
      </div>

      <Link href="/apps/color-test/pro" className="mt-6 text-fuchsia-400 text-sm hover:text-fuchsia-300 underline underline-offset-4">
        ★ Pro版で10種類のテスト（¥480）
      </Link>
    </main>
  );
}
