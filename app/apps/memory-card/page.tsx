'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const FREE_PAIRS = 6;
const EMOJIS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮'];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function newDeck(pairs: number): Card[] {
  const emojis = EMOJIS.slice(0, pairs);
  return [...emojis,...emojis]
    .map((emoji,i)=>({id:i,emoji,flipped:false,matched:false}))
    .sort(()=>Math.random()-.5)
    .map((c,i)=>({...c,id:i}));
}

export default function MemoryCardPage(){
  const [cards,setCards]=useState<Card[]>(newDeck(FREE_PAIRS));
  const [flipped,setFlipped]=useState<number[]>([]);
  const [moves,setMoves]=useState(0);
  const [won,setWon]=useState(false);
  const [disabled,setDisabled]=useState(false);

  const flip=(id:number)=>{
    if(disabled||cards[id].flipped||cards[id].matched||flipped.length===2) return;
    const nc=cards.map(c=>c.id===id?{...c,flipped:true}:c);
    const nf=[...flipped,id];
    setCards(nc); setFlipped(nf);
    if(nf.length===2){
      setMoves(m=>m+1); setDisabled(true);
      setTimeout(()=>{
        const [a,b]=nf;
        if(nc[a].emoji===nc[b].emoji){
          const mc=nc.map(c=>nf.includes(c.id)?{...c,matched:true}:c);
          setCards(mc); setFlipped([]); setDisabled(false);
          if(mc.every(c=>c.matched)) setWon(true);
        } else {
          setCards(nc.map(c=>nf.includes(c.id)?{...c,flipped:false}:c));
          setFlipped([]); setDisabled(false);
        }
      },800);
    }
  };

  const restart=()=>{ setCards(newDeck(FREE_PAIRS)); setFlipped([]); setMoves(0); setWon(false); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🃏 記憶カード</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 6ペア</span>
      </div>
      <div className="flex gap-4 mb-4">
        <span className="glass rounded-lg px-4 py-1.5 text-sm">手数: {moves}</span>
        {won && <span className="text-green-400 font-bold">🎉 クリア！</span>}
        <button onClick={restart} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm">シャッフル</button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card=>(
          <div key={card.id} onClick={()=>flip(card.id)}
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl cursor-pointer select-none transition-all duration-300
              ${card.flipped||card.matched?'bg-white/10 rotate-y-180':'bg-blue-600 hover:bg-blue-500'}`}>
            {(card.flipped||card.matched)?card.emoji:''}
          </div>
        ))}
      </div>
      <Link href="/apps/memory-card/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 20ペア・カスタム画像
      </Link>
    </main>
  );
}
