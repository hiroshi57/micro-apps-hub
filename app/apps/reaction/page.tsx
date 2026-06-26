'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

type Phase = 'idle'|'waiting'|'ready'|'result';

export default function ReactionPage(){
  const [phase,setPhase]=useState<Phase>('idle');
  const [times,setTimes]=useState<number[]>([]);
  const [current,setCurrent]=useState(0);
  const startRef=useRef(0);
  const timerRef=useRef<NodeJS.Timeout>();

  const begin=()=>{
    setPhase('waiting');
    const delay=1500+Math.random()*3000;
    timerRef.current=setTimeout(()=>{ setPhase('ready'); startRef.current=Date.now(); },delay);
  };

  const tap=()=>{
    if(phase==='waiting'){ clearTimeout(timerRef.current); setPhase('idle'); alert('早すぎ！赤くなったらタップ'); return; }
    if(phase==='ready'){
      const ms=Date.now()-startRef.current;
      setCurrent(ms);
      setTimes(t=>{const nt=[...t,ms]; if(nt.length>=5){ setPhase('result'); return nt; } setPhase('idle'); return nt; });
    }
  };

  const avg=times.length?Math.round(times.reduce((a,b)=>a+b,0)/times.length):0;
  const rank=avg<150?'⚡超人級':avg<200?'🏆優秀':avg<250?'👍平均的':avg<350?'😊普通':'🐌のんびり屋';

  const reset=()=>{ setTimes([]); setCurrent(0); setPhase('idle'); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">⚡ 反応速度テスト</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 5回計測</span>
      </div>
      <div className="flex gap-2 mb-4 text-xs text-gray-500">
        {times.map((t,i)=><span key={i} className="glass rounded-lg px-2 py-1">{t}ms</span>)}
        {Array.from({length:5-times.length},(_,i)=><span key={i} className="glass rounded-lg px-2 py-1 opacity-30">—</span>)}
      </div>

      {phase==='result' ? (
        <div className="text-center glass rounded-2xl p-10 max-w-sm w-full">
          <p className="text-5xl mb-3">{rank.split(' ')[0]}</p>
          <p className="text-3xl font-extrabold mb-1">{avg} ms</p>
          <p className="text-gray-400 mb-1">平均反応速度</p>
          <p className="text-lg mb-6">{rank.slice(2)}</p>
          <p className="text-gray-500 text-xs mb-4">世界平均: 約 250ms</p>
          <button onClick={reset} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-full">もう一度</button>
        </div>
      ) : (
        <div
          onClick={tap}
          className={`w-72 h-72 rounded-full flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 active:scale-95
            ${phase==='ready'?'bg-green-500 animate-pulse':phase==='waiting'?'bg-red-600':'bg-gray-700 hover:bg-gray-600'}`}
        >
          {phase==='idle'&&<><p className="text-5xl mb-2">👆</p><p className="font-bold text-lg">タップで開始</p><p className="text-gray-400 text-sm">({5-times.length}回残り)</p></>}
          {phase==='waiting'&&<><p className="text-4xl mb-2">⏳</p><p className="font-bold">待って…</p></>}
          {phase==='ready'&&<><p className="text-4xl mb-2">🟢</p><p className="font-extrabold text-2xl">今すぐタップ！</p></>}
        </div>
      )}
      {(phase==='idle'&&times.length>0&&times.length<5)&&(
        <button onClick={begin} className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-full">次へ ({5-times.length}回残り)</button>
      )}
      {phase==='idle'&&times.length===0&&<button onClick={begin} className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-full">スタート</button>}
      <Link href="/apps/reaction/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 10種テスト・30日グラフ
      </Link>
    </main>
  );
}
