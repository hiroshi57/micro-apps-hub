'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const FREE_SOUNDS = [
  { id:'rain', label:'雨音', emoji:'🌧️', freq:300, type:'noise' as const },
  { id:'wave', label:'波音', emoji:'🌊', freq:200, type:'noise' as const },
];

function createNoise(ctx: AudioContext, freq: number){
  const bufSize=2*ctx.sampleRate, buf=ctx.createBuffer(1,bufSize,ctx.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<bufSize;i++) data[i]=Math.random()*2-1;
  const source=ctx.createBufferSource(); source.buffer=buf; source.loop=true;
  const filter=ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=freq;
  const gain=ctx.createGain(); gain.gain.value=0.3;
  source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  source.start(); return {source,gain};
}

export default function NoisePage(){
  const [active,setActive]=useState<string|null>(null);
  const [vol,setVol]=useState(0.3);
  const ctxRef=useRef<AudioContext|null>(null);
  const nodeRef=useRef<{source:AudioBufferSourceNode;gain:GainNode}|null>(null);

  const toggle=(id:string,freq:number)=>{
    if(active===id){ nodeRef.current?.source.stop(); nodeRef.current=null; setActive(null); return; }
    nodeRef.current?.source.stop(); nodeRef.current=null;
    if(!ctxRef.current) ctxRef.current=new AudioContext();
    const n=createNoise(ctxRef.current,freq); nodeRef.current=n; setActive(id);
  };

  useEffect(()=>{ if(nodeRef.current) nodeRef.current.gain.gain.value=vol; },[vol]);
  useEffect(()=>()=>{ nodeRef.current?.source.stop(); },[]);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🎧 作業用 BGM</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 2種</span>
      </div>
      <p className="text-gray-500 text-sm mb-8">集中できる環境音でフロー状態へ</p>
      <div className="flex gap-4 mb-8">
        {FREE_SOUNDS.map(s=>(
          <button key={s.id} onClick={()=>toggle(s.id,s.freq)}
            className={`flex flex-col items-center gap-2 w-32 h-32 rounded-2xl border-2 transition-all
              ${active===s.id?'bg-blue-500/20 border-blue-400 scale-105':'bg-white/5 border-white/10 hover:border-white/30'}`}>
            <span className="text-4xl mt-4">{s.emoji}</span>
            <span className="text-sm font-medium">{s.label}</span>
            <span className="text-xs text-gray-500">{active===s.id?'▶ 再生中':'タップで再生'}</span>
          </button>
        ))}
        <button onClick={()=>{}} className="flex flex-col items-center gap-2 w-32 h-32 rounded-2xl border-2 border-pro-600/30 bg-pro-600/10">
          <span className="text-4xl mt-4">🔒</span>
          <span className="text-sm font-medium text-pro-400">+13種</span>
          <span className="text-xs text-pro-500">Pro で解放</span>
        </button>
      </div>
      {active && (
        <div className="flex items-center gap-3 glass rounded-xl px-5 py-3 mb-6">
          <span className="text-sm text-gray-400">音量</span>
          <input type="range" min={0} max={1} step={0.01} value={vol} onChange={e=>setVol(+e.target.value)} className="w-32" />
          <span className="text-sm text-gray-400">{Math.round(vol*100)}%</span>
        </div>
      )}
      <Link href="/apps/noise/pro" className="mt-2 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥680 — 15種・自由ミックス・ポモドーロ連携
      </Link>
    </main>
  );
}
