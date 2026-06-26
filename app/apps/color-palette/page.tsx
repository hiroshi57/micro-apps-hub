'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

function hslToHex(h:number,s:number,l:number){
  s/=100; l/=100;
  const a=s*Math.min(l,1-l);
  const f=(n:number)=>{ const k=(n+h/30)%12; const c=l-a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*c).toString(16).padStart(2,'0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function genPalette(base:number, scheme:'analogous'|'complementary'|'triadic'|'monochromatic'){
  const s=65,l=55;
  if(scheme==='analogous') return [-30,-15,0,15,30].map(d=>hslToHex((base+d+360)%360,s,l));
  if(scheme==='complementary') return [0,15,-15,180,165].map(d=>hslToHex((base+d+360)%360,s,l));
  if(scheme==='triadic') return [0,10,-10,120,240].map(d=>hslToHex((base+d+360)%360,s,l));
  return [0,0,0,0,0].map((_,i)=>hslToHex(base,s,30+i*12));
}

const SCHEMES = ['analogous','complementary','triadic','monochromatic'] as const;
const SCHEME_LABELS: Record<string,string> = { analogous:'類似色', complementary:'補色', triadic:'三角形', monochromatic:'同系色' };

export default function ColorPalettePage(){
  const [base,setBase]=useState(210);
  const [scheme,setScheme]=useState<typeof SCHEMES[number]>('analogous');
  const [copied,setCopied]=useState<string|null>(null);
  const palette=genPalette(base,scheme);

  const copy=(hex:string)=>{ navigator.clipboard.writeText(hex); setCopied(hex); setTimeout(()=>setCopied(null),1500); };
  const random=()=>setBase(Math.floor(Math.random()*360));

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🎨 カラーパレット</h1>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {SCHEMES.map(s=>(
          <button key={s} onClick={()=>setScheme(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${scheme===s?'bg-orange-500 text-white':'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
            {SCHEME_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-6 items-center">
        <label className="text-gray-500 text-sm">ベース色相:</label>
        <input type="range" min={0} max={359} value={base} onChange={e=>setBase(+e.target.value)} className="w-40" />
        <div className="w-8 h-8 rounded-lg border border-white/20" style={{background:`hsl(${base},65%,55%)`}} />
        <button onClick={random} className="bg-white/10 hover:bg-white/20 text-sm px-3 py-1 rounded-full">ランダム</button>
      </div>
      <div className="flex gap-3 mb-6">
        {palette.map(hex=>(
          <div key={hex} onClick={()=>copy(hex)} className="cursor-pointer group">
            <div className="w-20 h-32 rounded-2xl border-2 border-white/10 group-hover:border-white/30 transition-all" style={{background:hex}} />
            <p className="text-xs text-center mt-2 font-mono text-gray-400 group-hover:text-white">{copied===hex?'コピー済み!':hex}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs mb-2">色をクリックでHEXコードをコピー</p>
      <Link href="/apps/color-palette/pro" className="mt-4 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥580 — 8色・保存・CSS出力
      </Link>
    </main>
  );
}
