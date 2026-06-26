'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Op = '+'|'-'|'×';

function gen(level: 'easy'|'medium'): {a:number;b:number;op:Op;ans:number} {
  const ops: Op[] = level==='easy'?['+','-']:['+','-','×'];
  const op=ops[Math.floor(Math.random()*ops.length)];
  let a=0,b=0,ans=0;
  if(op==='+'){ a=Math.floor(Math.random()*50)+1; b=Math.floor(Math.random()*50)+1; ans=a+b; }
  else if(op==='-'){ a=Math.floor(Math.random()*50)+20; b=Math.floor(Math.random()*a)+1; ans=a-b; }
  else { a=Math.floor(Math.random()*12)+1; b=Math.floor(Math.random()*12)+1; ans=a*b; }
  return {a,b,op,ans};
}

export default function MathTrainerPage(){
  const [level]=useState<'easy'|'medium'>('easy');
  const [q,setQ]=useState(()=>gen('easy'));
  const [input,setInput]=useState('');
  const [score,setScore]=useState(0);
  const [total,setTotal]=useState(0);
  const [feedback,setFeedback]=useState<'correct'|'wrong'|null>(null);
  const [timeLeft,setTimeLeft]=useState(60);
  const [started,setStarted]=useState(false);
  const [finished,setFinished]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(!started||finished) return;
    const t=setInterval(()=>setTimeLeft(tl=>{ if(tl<=1){setFinished(true);return 0;} return tl-1; }),1000);
    return ()=>clearInterval(t);
  },[started,finished]);

  const submit=()=>{
    const val=parseInt(input);
    if(isNaN(val)) return;
    setTotal(t=>t+1);
    if(val===q.ans){ setScore(s=>s+1); setFeedback('correct'); }
    else { setFeedback('wrong'); }
    setTimeout(()=>{ setFeedback(null); setQ(gen(level)); setInput(''); inputRef.current?.focus(); },500);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🧮 計算力トレーナー</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 易・普通</span>
      </div>
      {!started&&!finished&&(
        <div className="text-center">
          <p className="text-gray-400 mb-6">60秒で何問正解できるか？</p>
          <button onClick={()=>setStarted(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-full text-lg">スタート</button>
        </div>
      )}
      {started&&!finished&&(
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-between mb-6">
            <span className="glass rounded-xl px-4 py-2">⏱ {timeLeft}秒</span>
            <span className="glass rounded-xl px-4 py-2">✅ {score}/{total}</span>
          </div>
          <div className={`glass rounded-2xl p-10 mb-6 transition-colors ${feedback==='correct'?'border-green-500':feedback==='wrong'?'border-red-500':''}`}>
            <p className="text-5xl font-extrabold text-white">{q.a} {q.op} {q.b} = ?</p>
          </div>
          <input ref={inputRef} type="number" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()} autoFocus
            className="w-full text-center text-3xl bg-white/10 border border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none text-white mb-3" placeholder="答え" />
          <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-full w-full">決定 (Enter)</button>
        </div>
      )}
      {finished&&(
        <div className="text-center glass rounded-2xl p-10 max-w-sm w-full">
          <p className="text-5xl mb-4">🧮</p>
          <p className="text-3xl font-extrabold mb-2">{score} / {total} 問正解</p>
          <p className="text-gray-400 mb-6">正答率: {total?Math.round(score/total*100):0}%</p>
          <button onClick={()=>{setScore(0);setTotal(0);setTimeLeft(60);setStarted(false);setFinished(false);setQ(gen(level));}} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-full">もう一度</button>
        </div>
      )}
      <Link href="/apps/math-trainer/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥480 — 掛算・割算・分数・成長グラフ
      </Link>
    </main>
  );
}
