'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

// ============================================================
// オセロロジック
// ============================================================
type Stone = 'B' | 'W' | null;
type Board = Stone[][];

const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function emptyBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  b[3][3] = 'W'; b[3][4] = 'B'; b[4][3] = 'B'; b[4][4] = 'W';
  return b;
}

function getFlips(board: Board, r: number, c: number, player: Stone): [number, number][] {
  if (board[r][c] !== null) return [];
  const opp = player === 'B' ? 'W' : 'B';
  const flips: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    const line: [number, number][] = [];
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opp) {
      line.push([nr, nc]); nr += dr; nc += dc;
    }
    if (line.length > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
      flips.push(...line);
    }
  }
  return flips;
}

function getLegalMoves(board: Board, player: Stone): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (getFlips(board, r, c, player).length > 0) moves.push([r, c]);
  return moves;
}

function applyMove(board: Board, r: number, c: number, player: Stone): Board {
  const flips = getFlips(board, r, c, player);
  if (flips.length === 0) return board;
  const next = board.map(row => [...row]);
  next[r][c] = player;
  flips.forEach(([fr, fc]) => { next[fr][fc] = player; });
  return next;
}

function countStones(board: Board): { B: number; W: number } {
  let B = 0, W = 0;
  board.flat().forEach(s => { if (s === 'B') B++; if (s === 'W') W++; });
  return { B, W };
}

/** 初級 AI: 合法手からランダム選択 */
function aiMove(board: Board, player: Stone): [number, number] | null {
  const moves = getLegalMoves(board, player);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// ============================================================
// Component
// ============================================================
export default function OthelloPage() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<Stone>('B'); // 人間=黒
  const [status, setStatus] = useState<'playing' | 'gameover'>('playing');
  const [message, setMessage] = useState('あなたの番（黒●）');

  const legalMoves = getLegalMoves(board, turn);

  const handleClick = useCallback((r: number, c: number) => {
    if (status !== 'playing' || turn !== 'B') return;
    const flips = getFlips(board, r, c, 'B');
    if (flips.length === 0) return;

    let next = applyMove(board, r, c, 'B');

    // AI の手番
    setTimeout(() => {
      const aiLegal = getLegalMoves(next, 'W');
      if (aiLegal.length > 0) {
        const [ar, ac] = aiMove(next, 'W')!;
        next = applyMove(next, ar, ac, 'W');
      }

      // 次の手番確認
      const humanLegal = getLegalMoves(next, 'B');
      const counts = countStones(next);

      if (humanLegal.length === 0 && getLegalMoves(next, 'W').length === 0) {
        setStatus('gameover');
        const winner = counts.B > counts.W ? '黒の勝ち 🎉' : counts.W > counts.B ? '白（AI）の勝ち' : '引き分け';
        setMessage(`ゲーム終了 — ${winner}`);
      } else {
        setMessage(`あなたの番（黒● ${counts.B} vs 白○ ${counts.W}）`);
      }
      setBoard(next);
    }, 300);

    setBoard(next);
    setMessage('AI が考え中…');
  }, [board, turn, status]);

  const restart = () => {
    setBoard(emptyBoard());
    setTurn('B');
    setStatus('playing');
    setMessage('あなたの番（黒●）');
  };

  const counts = countStones(board);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">⚫ オセロ</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 初級 AI</span>
      </div>

      <p className="text-gray-400 text-sm mb-4">{message}</p>

      {/* Score */}
      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <div className="w-10 h-10 bg-gray-900 border-2 border-white/30 rounded-full mx-auto mb-1 flex items-center justify-center text-2xl">⚫</div>
          <span className="text-2xl font-bold">{counts.B}</span>
          <p className="text-gray-500 text-xs">あなた</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-white rounded-full mx-auto mb-1 flex items-center justify-center text-2xl">⚪</div>
          <span className="text-2xl font-bold">{counts.W}</span>
          <p className="text-gray-500 text-xs">AI</p>
        </div>
      </div>

      {/* Board */}
      <div className="border-2 border-green-800 rounded-lg overflow-hidden bg-green-800">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
              return (
                <div
                  key={c}
                  onClick={() => handleClick(r, c)}
                  className={`w-12 h-12 border border-green-700 flex items-center justify-center cursor-pointer transition-colors
                    ${isLegal ? 'hover:bg-green-600/40' : ''}`}
                >
                  {cell === 'B' && <div className="w-9 h-9 bg-gray-900 border border-white/20 rounded-full shadow-lg" />}
                  {cell === 'W' && <div className="w-9 h-9 bg-white rounded-full shadow-lg" />}
                  {!cell && isLegal && <div className="w-3 h-3 bg-green-400/30 rounded-full" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button onClick={restart}
        className="mt-5 bg-white/10 hover:bg-white/20 text-white text-sm px-6 py-2 rounded-full transition-colors">
        新しいゲーム
      </button>

      <Link href="/apps/othello/pro" className="mt-3 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥480 — 中級・上級・最強 AI + ランキング
      </Link>
    </main>
  );
}
