'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Board = (number | 0)[][];

function emptyBoard(): Board { return Array.from({length:4},()=>Array(4).fill(0)); }

function addRandom(b: Board): Board {
  const empty: [number,number][] = [];
  b.forEach((row,r)=>row.forEach((v,c)=>{ if(!v) empty.push([r,c]); }));
  if(!empty.length) return b;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  const nb = b.map(row=>[...row]);
  nb[r][c] = Math.random()<0.9?2:4;
  return nb;
}

function initBoard(): Board { return addRandom(addRandom(emptyBoard())); }

function slide(row: number[]): number[] {
  const nums = row.filter(Boolean);
  const merged: number[] = [];
  let i = 0;
  while (i < nums.length) {
    if (i+1<nums.length&&nums[i]===nums[i+1]) { merged.push(nums[i]*2); i+=2; }
    else { merged.push(nums[i]); i++; }
  }
  while(merged.length<4) merged.push(0);
  return merged;
}

function move(b: Board, dir: 'left'|'right'|'up'|'down'): [Board,number] {
  let nb = b.map(r=>[...r]);
  let score = 0;
  if(dir==='left') { nb=nb.map(row=>{const s=slide(row);score+=s.reduce((a,v,i)=>a+(v>row[i]?v:0),0);return s;}); }
  else if(dir==='right') { nb=nb.map(row=>{const s=slide([...row].reverse()).reverse();score+=s.reduce((a,v,i)=>a+(v>row[i]?v:0),0);return s;}); }
  else if(dir==='up') {
    for(let c=0;c<4;c++){const col=nb.map(r=>r[c]);const s=slide(col);s.forEach((v,r)=>{score+=(v>nb[r][c]?v:0);nb[r][c]=v;});}
  } else {
    for(let c=0;c<4;c++){const col=nb.map(r=>r[c]).reverse();const s=slide(col).reverse();s.forEach((v,r)=>{score+=(v>nb[r][c]?v:0);nb[r][c]=v;});}
  }
  return [nb, score];
}

function changed(a: Board, b: Board) { return a.some((row,r)=>row.some((v,c)=>v!==b[r][c])); }

const COLORS: Record<number,string> = {
  0:'bg-gray-800',2:'bg-amber-100 text-gray-900',4:'bg-amber-200 text-gray-900',
  8:'bg-orange-400',16:'bg-orange-500',32:'bg-red-500',64:'bg-red-600',
  128:'bg-yellow-400',256:'bg-yellow-500',512:'bg-yellow-600',1024:'bg-yellow-700',2048:'bg-yellow-300 text-gray-900',
};

export default function Game2048() {
  const [board, setBoard] = useState<Board>(initBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);

  const handleMove = useCallback((dir:'left'|'right'|'up'|'down') => {
    if(over) return;
    setBoard(b=>{
      const [nb,sc] = move(b,dir);
      if(!changed(b,nb)) return b;
      const nb2 = addRandom(nb);
      setScore(s=>{const ns=s+sc;setBest(bst=>Math.max(bst,ns));return ns;});
      // game over check
      const dirs:Array<'left'|'right'|'up'|'down'> = ['left','right','up','down'];
      const stuck = dirs.every(d=>!changed(nb2,move(nb2,d)[0]));
      if(stuck) setOver(true);
      return nb2;
    });
  },[over]);

  useEffect(()=>{
    const h = (e:KeyboardEvent)=>{
      if(e.key==='ArrowLeft') handleMove('left');
      if(e.key==='ArrowRight') handleMove('right');
      if(e.key==='ArrowUp') handleMove('up');
      if(e.key==='ArrowDown') handleMove('down');
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[handleMove]);

  const restart = ()=>{ setBoard(initBoard()); setScore(0); setOver(false); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🔀 2048</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 4×4</span>
      </div>
      <div className="flex gap-4 mb-4">
        {[['スコア',score],['ベスト',best]].map(([l,v])=>(
          <div key={l as string} className="glass rounded-xl px-5 py-2 text-center">
            <p className="text-gray-500 text-xs">{l}</p>
            <p className="font-bold text-lg">{v}</p>
          </div>
        ))}
        <button onClick={restart} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm">新規</button>
      </div>
      <div className="bg-gray-800 p-2 rounded-2xl grid grid-cols-4 gap-2">
        {board.flat().map((v,i)=>(
          <div key={i} className={`w-16 h-16 rounded-xl flex items-center justify-center font-extrabold text-lg transition-all ${COLORS[v]||'bg-yellow-200 text-gray-900'}`}>
            {v||''}
          </div>
        ))}
      </div>
      {over && <p className="mt-4 text-red-400 font-bold text-xl">ゲームオーバー！</p>}
      <p className="text-gray-600 text-xs mt-3">矢印キーで操作</p>
      <Link href="/apps/2048/pro" className="mt-4 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 6×6・8×8・AI観戦
      </Link>
    </main>
  );
}
