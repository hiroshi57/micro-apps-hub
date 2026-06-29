'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

function generateCard(): number[][] {
  const cols = [
    shuffle(range(1, 15)),
    shuffle(range(16, 30)),
    shuffle(range(31, 45)),
    shuffle(range(46, 60)),
    shuffle(range(61, 75)),
  ].map(c => c.slice(0, 5));
  // FREE space
  cols[2][2] = 0;
  return Array.from({ length: 5 }, (_, r) => cols.map(c => c[r]));
}

function range(a: number, b: number) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function checkBingo(marked: Set<number>, card: number[][]): boolean {
  // rows
  for (const row of card) if (row.every(n => n === 0 || marked.has(n))) return true;
  // cols
  for (let c = 0; c < 5; c++) if (card.every(row => row[c] === 0 || marked.has(row[c]))) return true;
  // diagonals
  if ([0,1,2,3,4].every(i => card[i][i] === 0 || marked.has(card[i][i]))) return true;
  if ([0,1,2,3,4].every(i => card[i][4-i] === 0 || marked.has(card[i][4-i]))) return true;
  return false;
}

export default function BingoPage() {
  const [card, setCard] = useState(generateCard);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [called, setCalled] = useState<number[]>([]);
  const [bingo, setBingo] = useState(false);

  const callNext = useCallback(() => {
    if (bingo) return;
    const remaining = range(1, 75).filter(n => !called.includes(n));
    if (!remaining.length) return;
    const n = remaining[Math.floor(Math.random() * remaining.length)];
    const newCalled = [...called, n];
    const newMarked = new Set(marked);
    newMarked.add(n);
    setCalled(newCalled);
    setMarked(newMarked);
    if (checkBingo(newMarked, card)) setBingo(true);
  }, [called, marked, card, bingo]);

  const reset = () => {
    setCard(generateCard());
    setMarked(new Set());
    setCalled([]);
    setBingo(false);
  };

  const last = called[called.length - 1];
  const labels = ['B','I','N','G','O'];

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🎱 ビンゴカード</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 1枚</span>
      </div>

      {bingo && <div className="mb-4 text-3xl font-extrabold text-yellow-400 animate-pulse">🎉 BINGO!</div>}

      <div className="text-center mb-4">
        <div className="text-5xl font-extrabold text-yellow-400">{last ?? '—'}</div>
        <div className="text-gray-500 text-sm mt-1">{called.length} 番コール済み</div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 mb-1">
          {labels.map(l => <div key={l} className="w-12 text-center font-extrabold text-yellow-400 text-lg">{l}</div>)}
        </div>
        {card.map((row, r) => (
          <div key={r} className="flex gap-2 mb-2">
            {row.map((n, c) => {
              const isMarked = n === 0 || marked.has(n);
              return (
                <div key={c} className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold select-none
                  ${n === 0 ? 'bg-yellow-500 text-gray-900' : isMarked ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                  {n === 0 ? 'FREE' : n}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={callNext} disabled={bingo} className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold text-lg">
          次の番号を引く
        </button>
        <button onClick={reset} className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 font-bold">
          リセット
        </button>
      </div>

      <Link href="/apps/bingo/pro" className="mt-6 bg-gradient-to-r from-yellow-600 to-orange-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 10枚同時・カスタム・QR共有
      </Link>
    </main>
  );
}
