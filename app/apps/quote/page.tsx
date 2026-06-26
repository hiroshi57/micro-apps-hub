'use client';
import { useState } from 'react';
import Link from 'next/link';

const QUOTES = [
  { text:'継続は力なり', author:'ことわざ' },
  { text:'千里の道も一歩から', author:'老子' },
  { text:'失敗は成功のもと', author:'ことわざ' },
  { text:'明日は明日の風が吹く', author:'ことわざ' },
  { text:'七転び八起き', author:'ことわざ' },
  { text:'急がば回れ', author:'ことわざ' },
  { text:'石の上にも三年', author:'ことわざ' },
  { text:'塵も積もれば山となる', author:'ことわざ' },
  { text:'人事を尽くして天命を待つ', author:'ことわざ' },
  { text:'笑う門には福来る', author:'ことわざ' },
  { text:'好きこそものの上手なれ', author:'ことわざ' },
  { text:'知行合一', author:'王陽明' },
  { text:'為せば成る', author:'上杉鷹山' },
  { text:'一期一会', author:'茶道の精神' },
  { text:'温故知新', author:'論語' },
];

const COLORS=['from-violet-600 to-purple-500','from-blue-600 to-cyan-500','from-green-600 to-emerald-500','from-orange-600 to-yellow-500','from-pink-600 to-rose-500'];

export default function QuotePage(){
  const [idx,setIdx]=useState(Math.floor(Math.random()*QUOTES.length));
  const [colorIdx,setColorIdx]=useState(0);
  const q=QUOTES[idx];

  const next=()=>{ setIdx(Math.floor(Math.random()*QUOTES.length)); setColorIdx(c=>(c+1)%COLORS.length); };
  const share=()=>{ if(navigator.share) navigator.share({text:`「${q.text}」—${q.author}`}); else navigator.clipboard.writeText(`「${q.text}」—${q.author}`); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center py-8 px-4">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">💭 名言ジェネレーター</h1>
      </div>
      <div className={`w-full max-w-md rounded-3xl bg-gradient-to-br ${COLORS[colorIdx]} p-1 mb-8`}>
        <div className="bg-gray-950 rounded-3xl p-10 text-center">
          <p className="text-3xl font-bold leading-relaxed mb-4">{q.text}</p>
          <p className="text-gray-400">— {q.author}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={next} className={`bg-gradient-to-r ${COLORS[colorIdx]} text-white font-bold px-8 py-3 rounded-full`}>次の名言</button>
        <button onClick={share} className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full">シェア</button>
      </div>
      <Link href="/apps/quote/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 無制限・英語・壁紙ダウンロード
      </Link>
    </main>
  );
}
