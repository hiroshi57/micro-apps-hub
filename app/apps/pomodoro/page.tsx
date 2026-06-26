'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type Mode = 'work'|'break';
const DURATIONS = { work:25*60, break:5*60 };

export default function PomodoroPage(){
  const [mode,setMode]=useState<Mode>('work');
  const [left,setLeft]=useState(DURATIONS.work);
  const [running,setRunning]=useState(false);
  const [sessions,setSessions]=useState(0);
  const timerRef=useRef<NodeJS.Timeout>();

  const tick=useCallback(()=>{
    setLeft(l=>{
      if(l<=1){
        if(mode==='work'){ setSessions(s=>s+1); setMode('break'); return DURATIONS.break; }
        else { setMode('work'); return DURATIONS.work; }
      }
      return l-1;
    });
  },[mode]);

  useEffect(()=>{
    if(running){ timerRef.current=setInterval(tick,1000); }
    else clearInterval(timerRef.current);
    return ()=>clearInterval(timerRef.current);
  },[running,tick]);

  const toggle=()=>setRunning(r=>!r);
  const reset=()=>{ setRunning(false); setMode('work'); setLeft(DURATIONS.work); };
  const skip=()=>{ setRunning(false); const nm=mode==='work'?'break':'work'; setMode(nm); setLeft(DURATIONS[nm]); };

  const mins=Math.floor(left/60).toString().padStart(2,'0');
  const secs=(left%60).toString().padStart(2,'0');
  const progress=(1-left/DURATIONS[mode])*100;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🍅 ポモドーロ</h1>
      </div>
      <div className={`text-sm font-bold px-4 py-1.5 rounded-full mb-8 ${mode==='work'?'bg-red-500/20 text-red-300':'bg-green-500/20 text-green-300'}`}>
        {mode==='work'?'🎯 集中タイム':'☕ 休憩タイム'}
      </div>
      <div className="relative w-56 h-56 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke={mode==='work'?'#ef4444':'#22c55e'} strokeWidth="8"
            strokeDasharray={`${progress*2.827} 282.7`} strokeLinecap="round"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold font-mono">{mins}:{secs}</span>
          <span className="text-gray-500 text-sm mt-1">{mode==='work'?'集中':'休憩'}</span>
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <button onClick={toggle} className={`px-8 py-3 rounded-full font-bold text-lg ${running?'bg-gray-600 hover:bg-gray-500':'bg-red-500 hover:bg-red-400'} text-white`}>
          {running?'一時停止':'スタート'}
        </button>
        <button onClick={skip} className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white">スキップ</button>
        <button onClick={reset} className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white">リセット</button>
      </div>
      <div className="glass rounded-xl px-6 py-3 text-center">
        <p className="text-3xl font-bold">{sessions}</p>
        <p className="text-gray-500 text-sm">完了セッション</p>
      </div>
      <Link href="/apps/pomodoro/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥580 — カスタム時間・統計グラフ・BGM
      </Link>
    </main>
  );
}
