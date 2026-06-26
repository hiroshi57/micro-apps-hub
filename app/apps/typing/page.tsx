'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const WORDS = ['りんご','みかん','ぶどう','いちご','もも','なし','すいか','メロン','バナナ','さくらんぼ','きうい','マンゴー','パイナップル','ぶるーべりー','あぼかど','ぱぱいや','ここなっつ','ぐれーぷ','らずべりー','くらんべりー'];

export default function TypingPage(){
  const [idx,setIdx]=useState(0);
  const [input,setInput]=useState('');
  const [started,setStarted]=useState(false);
  const [finished,setFinished]=useState(false);
  const [correct,setCorrect]=useState(0);
  const [total,setTotal]=useState(0);
  const [timeLeft,setTimeLeft]=useState(60);
  const [wpm,setWpm]=useState(0);
  const inputRef=useRef<HTMLInputElement>(null);
  const timerRef=useRef<NodeJS.Timeout>();
  const startTime=useRef(Date.now());

  const current=WORDS[idx%WORDS.length];

  const start=()=>{ setStarted(true); setTimeLeft(60); setCorrect(0); setTotal(0); setIdx(0); setInput(''); setWpm(0); setFinished(false); startTime.current=Date.now(); inputRef.current?.focus(); };

  useEffect(()=>{
    if(!started||finished) return;
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ setFinished(true); clearInterval(timerRef.current); const elapsed=(Date.now()-startTime.current)/60000; setWpm(Math.round(correct/elapsed)); return 0; }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[started,finished,correct]);

  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    if(!started||finished) return;
    const val=e.target.value;
    setInput(val);
    if(val===current){
      setCorrect(c=>c+1); setTotal(t=>t+1); setIdx(i=>i+1); setInput('');
    } else if(!current.startsWith(val)){
      // wrong input flash but allow backspace to correct
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">⌨️ タイピング練習</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 日本語</span>
      </div>
      {!started && !finished && (
        <div className="text-center">
          <p className="text-gray-400 mb-6">60秒間でどれだけ入力できるか挑戦しよう</p>
          <button onClick={start} className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-8 py-3 rounded-full text-lg">スタート</button>
        </div>
      )}
      {started && !finished && (
        <div className="w-full max-w-lg text-center">
          <div className="flex justify-between mb-6">
            <span className="glass rounded-xl px-4 py-2">⏱ {timeLeft}秒</span>
            <span className="glass rounded-xl px-4 py-2">✅ {correct}語</span>
          </div>
          <div className="glass rounded-2xl p-8 mb-6">
            <p className="text-gray-500 text-sm mb-2">次の単語を入力してください</p>
            <p className="text-4xl font-bold text-white mb-2">{current}</p>
            <p className="text-gray-600 text-sm">（ひらがな・カタカナで入力）</p>
          </div>
          <input ref={inputRef} value={input} onChange={handleChange} autoFocus
            className={`w-full text-center text-2xl bg-white/10 border rounded-xl px-4 py-3 outline-none text-white
              ${input&&!current.startsWith(input)?'border-red-500':'border-white/20 focus:border-blue-500'}`}
            placeholder="ここに入力..." />
        </div>
      )}
      {finished && (
        <div className="text-center glass rounded-2xl p-10 max-w-sm w-full">
          <p className="text-5xl mb-4">⌨️</p>
          <p className="text-3xl font-extrabold text-white mb-2">{wpm} WPM</p>
          <p className="text-gray-400 mb-1">正解語数: {correct} 語</p>
          <p className="text-gray-500 text-sm mb-6">1分間のタイピング速度</p>
          <button onClick={start} className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-6 py-2.5 rounded-full">もう一度</button>
        </div>
      )}
      <Link href="/apps/typing/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥580 — 英語・プログラム・成長グラフ
      </Link>
    </main>
  );
}
