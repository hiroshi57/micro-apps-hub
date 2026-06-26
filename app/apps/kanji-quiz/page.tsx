'use client';
import { useState } from 'react';
import Link from 'next/link';

const N5 = [
  {kanji:'山',read:'やま',meaning:'山'},{kanji:'川',read:'かわ',meaning:'川'},
  {kanji:'日',read:'にち/ひ',meaning:'日・太陽'},{kanji:'本',read:'ほん',meaning:'本'},
  {kanji:'人',read:'ひと',meaning:'人'},{kanji:'火',read:'ひ',meaning:'火'},
  {kanji:'水',read:'みず',meaning:'水'},{kanji:'木',read:'き',meaning:'木'},
  {kanji:'金',read:'きん/かね',meaning:'金・お金'},{kanji:'土',read:'つち',meaning:'土'},
  {kanji:'月',read:'つき',meaning:'月'},{kanji:'花',read:'はな',meaning:'花'},
  {kanji:'車',read:'くるま',meaning:'車'},{kanji:'道',read:'みち',meaning:'道'},
  {kanji:'食',read:'しょく/た',meaning:'食べる'},{kanji:'飲',read:'の',meaning:'飲む'},
];

function shuffle<T>(a:T[]){ return [...a].sort(()=>Math.random()-.5); }
function makeChoices(correct:{kanji:string;read:string;meaning:string}){
  const others=shuffle(N5.filter(q=>q.kanji!==correct.kanji)).slice(0,3);
  return shuffle([correct,...others]);
}

export default function KanjiQuizPage(){
  const [qs]=useState(()=>shuffle(N5).slice(0,10));
  const [idx,setIdx]=useState(0);
  const [choices,setChoices]=useState(()=>makeChoices(shuffle(N5)[0]));
  const [score,setScore]=useState(0);
  const [answered,setAnswered]=useState<boolean[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [done,setDone]=useState(false);

  const current=qs[idx];

  const answer=(kanji:string)=>{
    if(selected) return;
    const ok=kanji===current.kanji;
    setSelected(kanji); if(ok) setScore(s=>s+1);
    setTimeout(()=>{
      const ni=idx+1;
      if(ni>=qs.length){ setDone(true); return; }
      setIdx(ni); setChoices(makeChoices(qs[ni])); setSelected(null);
    },700);
  };

  const restart=()=>{ setIdx(0); setChoices(makeChoices(qs[0])); setScore(0); setSelected(null); setDone(false); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🀄 漢字クイズ</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 N5</span>
      </div>
      {!done?(
        <div className="w-full max-w-sm">
          <div className="flex justify-between mb-4 text-sm">
            <span className="text-gray-500">{idx+1} / {qs.length}</span>
            <span className="text-yellow-400 font-bold">✅ {score}点</span>
          </div>
          <div className="glass rounded-2xl p-10 text-center mb-6">
            <p className="text-gray-500 text-sm mb-3">この漢字の読み方は？</p>
            <p className="text-8xl font-bold">{current.kanji}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {choices.map(c=>(
              <button key={c.kanji} onClick={()=>answer(c.kanji)} disabled={!!selected}
                className={`py-4 rounded-xl font-bold text-lg transition-all
                  ${!selected?'bg-white/10 hover:bg-white/20 text-white':
                    c.kanji===current.kanji?'bg-green-500 text-white':
                    c.kanji===selected?'bg-red-500 text-white':'bg-white/5 text-gray-600'}`}>
                {c.read}
              </button>
            ))}
          </div>
        </div>
      ):(
        <div className="text-center glass rounded-2xl p-10 max-w-sm w-full">
          <p className="text-5xl mb-4">🀄</p>
          <p className="text-3xl font-extrabold mb-2">{score} / {qs.length} 点</p>
          <p className="text-gray-400 mb-6">{score>=8?'素晴らしい！':score>=5?'まずまず！':'もっと練習しよう'}</p>
          <button onClick={restart} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-full">もう一度</button>
        </div>
      )}
      <Link href="/apps/kanji-quiz/pro" className="mt-6 bg-gradient-to-r from-pro-700 to-pro-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥680 — N1〜N4・苦手問題自動出題
      </Link>
    </main>
  );
}
