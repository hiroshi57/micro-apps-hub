'use client';
import { useState } from 'react';
import Link from 'next/link';

const SAMPLE_QUIZ = [
  { q: '日本の首都は？', choices: ['大阪', '東京', '京都', '名古屋'], ans: 1 },
  { q: '1 + 1 = ?', choices: ['1', '2', '3', '11'], ans: 1 },
  { q: '地球で最も大きい海は？', choices: ['大西洋', 'インド洋', '太平洋', '北極海'], ans: 2 },
  { q: 'Pythonの生みの親は？', choices: ['ビル・ゲイツ', 'グイド・ファン・ロッサム', 'リーナス・トーバルズ', 'デニス・リッチー'], ans: 1 },
  { q: '光の速度は約何 km/s？', choices: ['30万', '3万', '300万', '3000'], ans: 0 },
];

export default function QuizMakerPage() {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = SAMPLE_QUIZ[qi];

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.ans) setScore(s => s + 1);
    setTimeout(() => {
      if (qi + 1 >= SAMPLE_QUIZ.length) setDone(true);
      else { setQi(n => n + 1); setSelected(null); }
    }, 800);
  };

  const restart = () => { setQi(0); setSelected(null); setScore(0); setDone(false); };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">❓ クイズ作成ツール</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 5問</span>
      </div>

      {done ? (
        <div className="text-center mt-16">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-2xl font-bold mb-2">{score} / {SAMPLE_QUIZ.length} 正解</p>
          <p className="text-gray-400 mb-8">スコア: {Math.round(score / SAMPLE_QUIZ.length * 100)}%</p>
          <button onClick={restart} className="bg-rose-600 hover:bg-rose-500 px-8 py-3 rounded-full font-bold">もう一度</button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <p className="text-gray-500 text-sm mb-4">{qi + 1} / {SAMPLE_QUIZ.length}</p>
          <div className="bg-white/5 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold">{q.q}</p>
          </div>
          <div className="grid gap-3">
            {q.choices.map((c, i) => (
              <button key={i} onClick={() => choose(i)}
                className={`w-full text-left px-5 py-3 rounded-xl font-medium transition-all ${
                  selected === null ? 'bg-white/10 hover:bg-white/20' :
                  i === q.ans ? 'bg-green-600' :
                  i === selected ? 'bg-red-600' : 'bg-white/5 opacity-50'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <Link href="/apps/quiz-maker/pro" className="mt-10 bg-gradient-to-r from-rose-600 to-pink-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥580 — クイズ無制限作成・URLシェア
      </Link>
    </main>
  );
}
