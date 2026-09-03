'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

// ============================================================
// 数独ロジック
// ============================================================
type Cell = { value: number; given: boolean; notes: Set<number> };
type Grid = Cell[][];

function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: 0, given: false, notes: new Set<number>() }))
  );
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solve(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        for (const n of nums) {
          if (isValid(grid, r, c, n)) {
            grid[r][c] = n;
            if (solve(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(clues: number): Grid {
  const raw = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(raw);
  const solution = raw.map(r => [...r]);

  // clues 分だけ残して消す
  const cells = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  let removed = 0;
  const needed = 81 - clues;
  for (const idx of cells) {
    if (removed >= needed) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    raw[r][c] = 0;
    removed++;
  }

  return raw.map((row, r) => row.map((v, c) => ({
    value: v,
    given: v !== 0,
    notes: new Set<number>(),
  })));
}

// ============================================================
// Component
// ============================================================
const DIFFICULTY = { easy: 36, medium: 28 }; // 無料版は easy/medium

export default function SudokuPage() {
  // 2026-09-03: generatePuzzle()内でMath.random()を使うため、useState初期化
  // 関数の中で直接呼ぶとSSR時とクライアント初回レンダー時で異なる盤面が
  // 生成され、React hydrationエラー（#418）が発生していた（本番で実確認）。
  // 初期値はサーバー・クライアントで一致する空盤面にし、マウント後の
  // useEffectでランダム生成する（クライアントのみで実行されるため一致する）。
  const [grid, setGrid] = useState<Grid>(() => emptyGrid());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [mistakes, setMistakes] = useState(0);
  const [showProWall, setShowProWall] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setGrid(generatePuzzle(DIFFICULTY.easy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newGame = useCallback((diff: 'easy' | 'medium') => {
    setDifficulty(diff);
    setGrid(generatePuzzle(DIFFICULTY[diff]));
    setSelected(null);
    setMistakes(0);
    setSolved(false);
  }, []);

  const selectCell = (r: number, c: number) => {
    if (grid[r][c].given) return;
    setSelected([r, c]);
  };

  const inputNumber = (num: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (grid[r][c].given) return;

    const next = grid.map(row => row.map(cell => ({ ...cell, notes: new Set(cell.notes) })));
    next[r][c].value = num;

    // 正解チェック
    const complete = next.every(row => row.every(cell => cell.value !== 0));
    if (complete) setSolved(true);

    setGrid(next);
  };

  const clearCell = () => {
    if (!selected) return;
    const [r, c] = selected;
    if (grid[r][c].given) return;
    const next = grid.map(row => row.map(cell => ({ ...cell, notes: new Set(cell.notes) })));
    next[r][c].value = 0;
    setGrid(next);
  };

  const isHighlighted = (r: number, c: number) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    return r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3));
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🔢 数独</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 易・普通</span>
      </div>

      {/* Difficulty */}
      <div className="flex gap-2 mb-4">
        {(['easy', 'medium'] as const).map(d => (
          <button key={d} onClick={() => newGame(d)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${difficulty === d ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
            {d === 'easy' ? '易しい' : '普通'}
          </button>
        ))}
        <button onClick={() => setShowProWall(true)}
          className="px-4 py-1.5 rounded-full text-sm font-medium bg-pro-600/20 text-pro-400 border border-pro-600/30">
          難しい・鬼 🔒
        </button>
      </div>

      {solved && (
        <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full">
          🎉 クリア！おめでとうございます
        </div>
      )}

      {/* Grid */}
      <div className="border-2 border-white/30 rounded-lg overflow-hidden">
        {grid.map((row, r) => (
          <div key={r} className={`flex ${r % 3 === 2 && r !== 8 ? 'border-b-2 border-white/30' : ''}`}>
            {row.map((cell, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const hl = isHighlighted(r, c);
              return (
                <div
                  key={c}
                  onClick={() => selectCell(r, c)}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold cursor-pointer select-none
                    ${c % 3 === 2 && c !== 8 ? 'border-r-2 border-white/30' : 'border-r border-white/10'}
                    ${r !== 0 ? 'border-t border-white/10' : ''}
                    ${isSelected ? 'bg-blue-500/40' : hl ? 'bg-white/10' : 'bg-gray-900'}
                    ${cell.given ? 'text-white' : 'text-blue-400'}
                    transition-colors`}
                >
                  {cell.value !== 0 ? cell.value : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Number pad */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => inputNumber(n)}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl transition-colors">
            {n}
          </button>
        ))}
        <button onClick={clearCell}
          className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-colors text-sm">
          消
        </button>
      </div>

      <Link href="/apps/sudoku/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥480 — 難・鬼・ヒント無制限
      </Link>

      {/* Pro wall modal */}
      {showProWall && (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 text-center max-w-sm w-full">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">難しい以上は Pro</h2>
            <p className="text-gray-400 text-sm mb-6">難・超難・地獄難易度 + ヒント無制限</p>
            <Link href="/apps/sudoku/pro"
              className="block bg-gradient-to-r from-pro-600 to-pro-500 text-white font-bold py-3 rounded-full">
              ¥480 で Pro を購入
            </Link>
            <button onClick={() => setShowProWall(false)} className="mt-3 text-gray-500 text-sm">キャンセル</button>
          </div>
        </div>
      )}
    </main>
  );
}
