'use client';
import { useState } from 'react';
import Link from 'next/link';

const HAIKU_LIST = [
  { lines: ['古池や', '蛙飛び込む', '水の音'], author: '松尾芭蕉', season: '春' },
  { lines: ['閑さや', '岩にしみ入る', '蝉の声'], author: '松尾芭蕉', season: '夏' },
  { lines: ['荒海や', '佐渡に横たふ', '天の川'], author: '松尾芭蕉', season: '秋' },
  { lines: ['旅に病んで', '夢は枯野を', 'かけ廻る'], author: '松尾芭蕉', season: '冬' },
  { lines: ['春の海', 'ひねもすのたり', 'のたりかな'], author: '与謝蕪村', season: '春' },
  { lines: ['菜の花や', '月は東に', '日は西に'], author: '与謝蕪村', season: '春' },
];

const BG_COLORS: Record<string, string> = {
  春: 'from-pink-900 to-gray-950',
  夏: 'from-blue-900 to-gray-950',
  秋: 'from-orange-900 to-gray-950',
  冬: 'from-slate-800 to-gray-950',
};

export default function HaikuPage() {
  const today = HAIKU_LIST[new Date().getDate() % HAIKU_LIST.length];
  const [haiku, setHaiku] = useState(today);
  const [copied, setCopied] = useState(false);

  const random = () => {
    const next = HAIKU_LIST[Math.floor(Math.random() * HAIKU_LIST.length)];
    setHaiku(next);
    setCopied(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(haiku.lines.join(' / '));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-b ${BG_COLORS[haiku.season]} text-white flex flex-col items-center py-8 px-4`}>
      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🌸 俳句ジェネレーター</h1>
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">無料版 今日の1首</span>
      </div>

      <div className="relative w-full max-w-sm mt-8 mb-4">
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-center">
          <div className="space-y-4 mb-6">
            {haiku.lines.map((line, i) => (
              <p key={i} className={`font-bold tracking-widest ${i === 1 ? 'text-3xl' : 'text-2xl'} text-white`}>
                {line}
              </p>
            ))}
          </div>
          <p className="text-gray-400 text-sm">— {haiku.author}　{haiku.season}の句</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={random} className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold">
          🔀 別の句
        </button>
        <button onClick={copy} className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold">
          {copied ? '✓ コピーした' : '📋 コピー'}
        </button>
      </div>

      <Link href="/apps/haiku/pro" className="mt-8 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
        ★ Pro ¥380 — 無限生成・季語500+・画像保存
      </Link>
    </main>
  );
}
