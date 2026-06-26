'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adj: number };
type Grid = Cell[][];
const FREE_LEVEL = { rows: 9, cols: 9, mines: 10 };

function buildGrid(rows: number, cols: number, mines: number, sr: number, sc: number): Grid {
  const g: Grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adj: 0 }))
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!g[r][c].mine && !(r === sr && c === sc)) { g[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (g[r][c].mine) continue;
    let cnt = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r+dr, nc = c+dc;
      if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&g[nr][nc].mine) cnt++;
    }
    g[r][c].adj = cnt;
  }
  return g;
}

function reveal(g: Grid, r: number, c: number, rows: number, cols: number): Grid {
  if (r<0||r>=rows||c<0||c>=cols||g[r][c].revealed||g[r][c].flagged) return g;
  const ng = g.map(row => row.map(cell => ({...cell})));
  ng[r][c].revealed = true;
  if (ng[r][c].adj === 0 && !ng[r][c].mine) {
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) reveal(ng, r+dr, c+dc, rows, cols).forEach((row,ri)=>row.forEach((cell,ci)=>{ ng[ri][ci]=cell; }));
  }
  return ng;
}

export default function MinesweeperPage() {
  const { rows, cols, mines } = FREE_LEVEL;
  const [grid, setGrid] = useState<Grid | null>(null);
  const [status, setStatus] = useState<'idle'|'playing'|'win'|'lose'>('idle');
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);

  const start = useCallback((r: number, c: number) => {
    const g = buildGrid(rows, cols, mines, r, c);
    const g2 = reveal(g, r, c, rows, cols);
    setGrid(g2); setStatus('playing'); setFlags(0); setTime(0);
  }, [rows, cols, mines]);

  const click = (r: number, c: number) => {
    if (status === 'idle') { start(r, c); return; }
    if (status !== 'playing' || !grid) return;
    if (grid[r][c].flagged || grid[r][c].revealed) return;
    if (grid[r][c].mine) {
      const ng = grid.map(row=>row.map(cell=>({...cell, revealed: true})));
      setGrid(ng); setStatus('lose'); return;
    }
    const ng = reveal(grid, r, c, rows, cols);
    const won = ng.flat().filter(c=>!c.mine).every(c=>c.revealed);
    setGrid(ng); if (won) setStatus('win');
  };

  const rightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (!grid || status !== 'playing') return;
    if (grid[r][c].revealed) return;
    const ng = grid.map(row=>row.map(cell=>({...cell})));
    ng[r][c].flagged = !ng[r][c].flagged;
    setFlags(f => ng[r][c].flagged ? f+1 : f-1);
    setGrid(ng);
  };

  const reset = () => { setGrid(null); setStatus('idle'); setFlags(0); setTime(0); };

  const adjColor = ['','#3b82f6','#22c55e','#ef4444','#6366f1','#f97316','#06b6d4','#a855f7','#64748b'];

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">💣 マインスイーパー</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 初級</span>
      </div>
      <div className="flex gap-6 mb-4 text-sm">
        <span>🚩 {mines - flags}</span>
        <span>{status==='win'?'🎉 クリア！':status==='lose'?'💥 ゲームオーバー':status==='idle'?'クリックで開始':'プレイ中'}</span>
        <button onClick={reset} className="bg-white/10 px-3 py-0.5 rounded-full hover:bg-white/20">リセット</button>
      </div>
      <div className="border border-white/10 rounded-xl overflow-hidden">
        {(grid ?? Array.from({length:rows},()=>Array(cols).fill(null))).map((row,r) => (
          <div key={r} className="flex">
            {row.map((_,c) => {
              const cell = grid?.[r][c];
              return (
                <div key={c} onClick={()=>click(r,c)} onContextMenu={e=>rightClick(e,r,c)}
                  className={`w-9 h-9 border border-white/5 flex items-center justify-center text-sm font-bold cursor-pointer select-none
                    ${cell?.revealed ? cell.mine ? 'bg-red-600' : 'bg-gray-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                  style={{color: cell?.revealed&&!cell.mine&&cell.adj?adjColor[cell.adj]:undefined}}>
                  {cell?.flagged&&!cell.revealed?'🚩':cell?.revealed?(cell.mine?'💣':cell.adj||''):''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <Link href="/apps/minesweeper/pro" className="mt-5 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 中級・上級・カスタム
      </Link>
    </main>
  );
}
