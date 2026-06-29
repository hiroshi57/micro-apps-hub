'use client';
import { useState } from 'react';
import Link from 'next/link';

const PRESET_CARDS = [
  { front: '林檎 (りんご)', back: 'apple' },
  { front: '猫 (ねこ)', back: 'cat' },
  { front: '空 (そら)', back: 'sky' },
  { front: '山 (やま)', back: 'mountain' },
  { front: '海 (うみ)', back: 'sea' },
  { front: '花 (はな)', back: 'flower' },
  { front: '本 (ほん)', back: 'book' },
  { front: '車 (くるま)', back: 'car' },
  { front: '雨 (あめ)', back: 'rain' },
  { front: '月 (つき)', back: 'moon' },
];

export default function FlashcardPage() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ ok: 0, ng: 0 });

  const card = PRESET_CARDS[idx];
  const next = (ok: boolean) => {
    setScore(s => ok ? { ...s, ok: s.ok + 1 } : { ...s, ng: s.ng + 1 });
    setFlipped(false);
    setTimeout(() => setIdx(i => (i + 1) % PRESET_CARDS.length), 150);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">📖 単語帳メーカー</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 10枚</span>
      </div>
      <p className="text-gray-500 text-sm mb-4">{idx + 1} / {PRESET_CARDS.length} — 正解: {score.ok} / 不正解: {score.ng}</p>

      <div
        className="w-72 h-44 rounded-2xl flex items-center justify-center text-center text-2xl font-bold cursor-pointer select-none transition-all duration-300 mb-6"
        style={{ background: flipped ? '#1e3a5f' : '#1e293b', border: '1px solid rgba(99,102,241,0.4)' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div>
          <div className="text-xs text-gray-500 mb-2">{flipped ? '意味' : '単語'}</div>
          {flipped ? card.back : card.front}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">タップで{flipped ? '表' : '裏'}に反転</p>

      {flipped && (
        <div className="flex gap-4">
          <button onClick={() => next(false)} className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 font-bold">✗ 不正解</button>
          <button onClick={() => next(true)} className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-500 font-bold">✓ 正解</button>
        </div>
      )}

      <Link href="/apps/flashcard/pro" className="mt-8 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥480 — カード無制限・スペースド反復
      </Link>
    </main>
  );
}
