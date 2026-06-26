'use client';
import { useState } from 'react';
import Link from 'next/link';

type Hand = 'rock'|'paper'|'scissors';
const HANDS: Hand[] = ['rock','paper','scissors'];
const EMOJI: Record<Hand,string> = { rock:'✊', paper:'✋', scissors:'✌️' };
const LABEL: Record<Hand,string> = { rock:'グー', paper:'パー', scissors:'チョキ' };

function judge(p: Hand, ai: Hand): 'win'|'lose'|'draw' {
  if(p===ai) return 'draw';
  if((p==='rock'&&ai==='scissors')||(p==='scissors'&&ai==='paper')||(p==='paper'&&ai==='rock')) return 'win';
  return 'lose';
}

export default function RPSPage(){
  const [history,setHistory]=useState<{player:Hand;ai:Hand;result:ReturnType<typeof judge>}[]>([]);
  const [last,setLast]=useState<{player:Hand;ai:Hand;result:ReturnType<typeof judge>}|null>(null);

  const play=(choice:Hand)=>{
    const ai=HANDS[Math.floor(Math.random()*3)];
    const result=judge(choice,ai);
    const entry={player:choice,ai,result};
    setLast(entry);
    setHistory(h=>[entry,...h.slice(0,9)]);
  };

  const wins=history.filter(h=>h.result==='win').length;
  const losses=history.filter(h=>h.result==='lose').length;
  const draws=history.filter(h=>h.result==='draw').length;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">✂️ じゃんけん AI</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">ランダム AI</span>
      </div>
      {last && (
        <div className="glass rounded-2xl p-6 text-center mb-6 min-w-[280px]">
          <div className="flex justify-center gap-8 text-6xl mb-3">
            <div className="text-center"><p className="text-xs text-gray-500 mb-1">あなた</p>{EMOJI[last.player]}</div>
            <div className="text-4xl self-center text-gray-600">VS</div>
            <div className="text-center"><p className="text-xs text-gray-500 mb-1">AI</p>{EMOJI[last.ai]}</div>
          </div>
          <p className={`text-2xl font-extrabold ${last.result==='win'?'text-green-400':last.result==='lose'?'text-red-400':'text-gray-400'}`}>
            {last.result==='win'?'🎉 あなたの勝ち':last.result==='lose'?'😢 AI の勝ち':'🤝 引き分け'}
          </p>
        </div>
      )}
      <div className="flex gap-4 mb-6">
        {HANDS.map(h=>(
          <button key={h} onClick={()=>play(h)}
            className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl transition-all active:scale-95">
            <span className="text-5xl">{EMOJI[h]}</span>
            <span className="text-xs text-gray-400">{LABEL[h]}</span>
          </button>
        ))}
      </div>
      {history.length>0 && (
        <div className="flex gap-6 text-center mb-4">
          <div><p className="text-green-400 font-bold text-xl">{wins}</p><p className="text-gray-500 text-xs">勝ち</p></div>
          <div><p className="text-red-400 font-bold text-xl">{losses}</p><p className="text-gray-500 text-xs">負け</p></div>
          <div><p className="text-gray-400 font-bold text-xl">{draws}</p><p className="text-gray-500 text-xs">引分</p></div>
        </div>
      )}
      <Link href="/apps/rock-paper-scissors/pro" className="mt-2 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥480 — 学習型AI（あなたのクセを読む）
      </Link>
    </main>
  );
}
