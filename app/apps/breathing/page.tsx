'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Phase = 'inhale'|'hold'|'exhale'|'pause'|'idle';
const PATTERN = { inhale:4, hold:7, exhale:8, pause:0 }; // 4-7-8

export default function BreathingPage(){
  const [phase,setPhase]=useState<Phase>('idle');
  const [count,setCount]=useState(4);
  const [cycles,setCycles]=useState(0);
  const [running,setRunning]=useState(false);
  const timerRef=useRef<NodeJS.Timeout>();

  const PHASES: Phase[] = ['inhale','hold','exhale'];
  const LABELS: Record<Phase,string> = { inhale:'息を吸う',hold:'息を止める',exhale:'息を吐く',pause:'',idle:'準備' };
  const DURATIONS: Record<Phase,number> = { inhale:4,hold:7,exhale:8,pause:2,idle:0 };

  useEffect(()=>{
    if(!running) return;
    let pi=0; let c=DURATIONS[PHASES[0]]; setPhase(PHASES[0]); setCount(c);
    timerRef.current=setInterval(()=>{
      c--;
      if(c<=0){
        pi=(pi+1)%PHASES.length;
        if(pi===0) setCycles(n=>n+1);
        c=DURATIONS[PHASES[pi]];
        setPhase(PHASES[pi]);
      }
      setCount(c);
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[running]);

  const toggle=()=>{
    if(running){ setRunning(false); setPhase('idle'); setCount(4); clearInterval(timerRef.current); }
    else setRunning(true);
  };

  const scale=phase==='inhale'?1.3:phase==='exhale'?0.85:phase==='hold'?1.25:1;
  const color=phase==='inhale'?'#60a5fa':phase==='hold'?'#a78bfa':phase==='exhale'?'#34d399':'#6b7280';

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🌬️ 呼吸瞑想</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">4-7-8 呼吸法</span>
      </div>
      <p className="text-gray-500 text-sm mb-10">鼻から4秒吸い→7秒止め→口から8秒吐く</p>
      <div className="relative flex items-center justify-center mb-10" style={{width:240,height:240}}>
        <div className="absolute rounded-full opacity-20 transition-all duration-1000" style={{width:200,height:200,background:color,transform:`scale(${scale})`}} />
        <div className="absolute rounded-full opacity-40 transition-all duration-1000" style={{width:160,height:160,background:color,transform:`scale(${scale})`}} />
        <div className="relative rounded-full flex flex-col items-center justify-center transition-all duration-1000" style={{width:120,height:120,background:color,transform:`scale(${scale})`}}>
          <span className="text-3xl font-extrabold text-white">{phase!=='idle'?count:''}</span>
          <span className="text-white text-xs mt-0.5">{LABELS[phase]}</span>
        </div>
      </div>
      <button onClick={toggle} className={`px-8 py-3 rounded-full font-bold text-lg mb-6 ${running?'bg-gray-600 hover:bg-gray-500':'bg-sky-500 hover:bg-sky-400'} text-white`}>
        {running?'止める':'開始'}
      </button>
      {cycles>0&&<p className="text-gray-400 text-sm">完了サイクル: {cycles}回</p>}
      <Link href="/apps/breathing/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥580 — 8種類の呼吸法・環境音
      </Link>
    </main>
  );
}
