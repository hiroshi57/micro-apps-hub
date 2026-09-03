'use client';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

function newPuzzle(n:number){ const a=Array.from({length:n*n},(_,i)=>i).sort(()=>Math.random()-.5); return a; }
function orderedTiles(n:number){ return Array.from({length:n*n},(_,i)=>i); }
function isSolved(tiles:number[]){ return tiles.every((v,i)=>v===i); }

export default function SlidePuzzlePage(){
  const [size,setSize]=useState(4);
  // 2026-09-03: newPuzzle()内のMath.random()をuseState初期化関数の中で
  // 直接呼ぶとSSR時とクライアント初回レンダー時で並びが食い違い、React
  // hydrationエラー（#418）が発生していた（本番で実確認）。初期値は
  // サーバー・クライアントで一致する整列済み配列にし、マウント後の
  // useEffectでシャッフルする。
  const [tiles,setTiles]=useState<number[]>(()=>orderedTiles(4));
  const [moves,setMoves]=useState(0);
  const [won,setWon]=useState(false);

  useEffect(() => {
    setTiles(newPuzzle(4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move=(idx:number)=>{
    if(won) return;
    const empty=tiles.indexOf(0);
    const row=Math.floor(idx/size),col=idx%size;
    const er=Math.floor(empty/size),ec=empty%size;
    if(!((row===er&&Math.abs(col-ec)===1)||(col===ec&&Math.abs(row-er)===1))) return;
    const nt=[...tiles];
    [nt[idx],nt[empty]]=[nt[empty],nt[idx]];
    setMoves(m=>m+1); setTiles(nt);
    if(isSolved(nt)) setWon(true);
  };

  const restart=(s:number)=>{ setSize(s); setTiles(newPuzzle(s)); setMoves(0); setWon(false); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🔲 スライドパズル</h1>
      </div>
      <div className="flex gap-2 mb-4">
        {[3,4].map(s=>(
          <button key={s} onClick={()=>restart(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${size===s?'bg-teal-500 text-white':'bg-white/10 text-gray-400 hover:bg-white/20'}`}>{s}×{s}</button>
        ))}
        <button onClick={()=>setWon(true)} className="px-4 py-1.5 rounded-full text-sm bg-pro-600/20 text-pro-400 border border-pro-600/30">5×6×は Pro 🔒</button>
      </div>
      <div className="flex gap-4 mb-3">
        <span className="glass rounded-lg px-4 py-1 text-sm">手数: {moves}</span>
        {won && <span className="text-green-400 font-bold animate-fade-in">🎉 クリア！</span>}
      </div>
      <div className={`grid gap-1.5`} style={{gridTemplateColumns:`repeat(${size},1fr)`}}>
        {tiles.map((v,i)=>(
          <div key={i} onClick={()=>move(i)}
            className={`flex items-center justify-center rounded-xl font-bold text-xl cursor-pointer select-none transition-all
              ${v===0?'bg-transparent':'bg-teal-600 hover:bg-teal-500 text-white shadow-lg'}`}
            style={{width:`${Math.floor(320/size)}px`,height:`${Math.floor(320/size)}px`}}>
            {v||''}
          </div>
        ))}
      </div>
      <Link href="/apps/slide-puzzle/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 5×5・6×6・画像パズル
      </Link>
    </main>
  );
}
