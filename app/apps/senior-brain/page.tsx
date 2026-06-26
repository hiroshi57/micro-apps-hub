'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ============================================================
// シニア向け脳トレ — 無料版
// 3種類のゲーム: 数字記憶 / 計算 / 言葉記憶
// 1日5問まで（Pro壁）
// ============================================================

const FREE_DAILY_LIMIT = 5;
const STORAGE_KEY = 'senior-brain-count';

type GameMode = 'menu' | 'number' | 'calc' | 'word' | 'result';

interface GameState {
  mode: GameMode;
  question: string;
  answer: string;
  userAnswer: string;
  phase: 'show' | 'input' | 'feedback';
  score: number;
  correct: number;
  total: number;
  showProWall: boolean;
  countdown: number;
}

// 今日の日付キー
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// 今日のプレイ数を取得
function getTodayCount(): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[todayKey()] ?? 0;
  } catch { return 0; }
}

// 今日のプレイ数を増やす
function incrementCount() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[todayKey()] = (data[todayKey()] ?? 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// 数字記憶問題
function genNumberQuestion(difficulty: number) {
  const len = Math.min(3 + difficulty, 7);
  const nums = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
  return { question: nums.join('  '), answer: nums.join('') };
}

// 計算問題
function genCalcQuestion(difficulty: number) {
  const a = Math.floor(Math.random() * (10 + difficulty * 5)) + 1;
  const b = Math.floor(Math.random() * (10 + difficulty * 3)) + 1;
  const ops = difficulty < 2 ? ['+', '-'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer = 0;
  if (op === '+') answer = a + b;
  if (op === '-') answer = Math.abs(a - b);
  if (op === '×') answer = a * b;
  const q = op === '-' ? `${Math.max(a, b)} − ${Math.min(a, b)}` : `${a} ${op} ${b}`;
  return { question: `${q} = ?`, answer: String(answer) };
}

// 言葉記憶問題
const WORD_SETS = [
  ['りんご', 'みかん', 'ぶどう'],
  ['いぬ', 'ねこ', 'うさぎ'],
  ['くるま', 'でんしゃ', 'ひこうき'],
  ['あか', 'あお', 'きいろ'],
  ['はる', 'なつ', 'あき', 'ふゆ'],
  ['やま', 'かわ', 'うみ'],
];

function genWordQuestion() {
  const set = WORD_SETS[Math.floor(Math.random() * WORD_SETS.length)];
  return { question: set.join('　'), answer: set.join('') };
}

export default function SeniorBrainPage() {
  const [state, setState] = useState<GameState>({
    mode: 'menu',
    question: '',
    answer: '',
    userAnswer: '',
    phase: 'show',
    score: 0,
    correct: 0,
    total: 0,
    showProWall: false,
    countdown: 3,
  });
  const [todayCount, setTodayCount] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    setTodayCount(getTodayCount());
  }, []);

  const checkLimit = useCallback(() => {
    const count = getTodayCount();
    if (count >= FREE_DAILY_LIMIT) {
      setState(s => ({ ...s, showProWall: true }));
      return false;
    }
    return true;
  }, []);

  // ゲーム開始
  const startGame = useCallback((mode: 'number' | 'calc' | 'word') => {
    if (!checkLimit()) return;
    let q = { question: '', answer: '' };
    if (mode === 'number') q = genNumberQuestion(difficulty);
    if (mode === 'calc') q = genCalcQuestion(difficulty);
    if (mode === 'word') q = genWordQuestion();

    setState(s => ({
      ...s,
      mode,
      question: q.question,
      answer: q.answer,
      userAnswer: '',
      phase: 'show',
      countdown: mode === 'calc' ? 0 : 3,
    }));
    setFeedback(null);

    if (mode !== 'calc') {
      // 数字・言葉は一定時間表示後に入力画面へ
      let count = mode === 'word' ? 4 : 3;
      setState(s => ({ ...s, countdown: count }));
      const timer = setInterval(() => {
        count--;
        setState(s => ({ ...s, countdown: count }));
        if (count <= 0) {
          clearInterval(timer);
          setState(s => ({ ...s, phase: 'input' }));
        }
      }, 1000);
    } else {
      setState(s => ({ ...s, phase: 'input' }));
    }
  }, [difficulty, checkLimit]);

  // 答え送信
  const submitAnswer = useCallback(() => {
    const isCorrect = state.userAnswer.replace(/\s/g, '') === state.answer.replace(/\s/g, '');
    setFeedback(isCorrect ? 'correct' : 'wrong');
    incrementCount();
    const newCount = getTodayCount();
    setTodayCount(newCount);
    const newCorrect = state.correct + (isCorrect ? 1 : 0);
    const newTotal = state.total + 1;

    setState(s => ({
      ...s,
      phase: 'feedback',
      correct: newCorrect,
      total: newTotal,
    }));

    setTimeout(() => {
      if (newCount >= FREE_DAILY_LIMIT) {
        setState(s => ({ ...s, showProWall: true }));
      } else {
        setState(s => ({
          ...s,
          mode: 'menu',
          phase: 'show',
          userAnswer: '',
        }));
        setFeedback(null);
      }
      if (isCorrect && newTotal % 3 === 0) {
        setDifficulty(d => Math.min(d + 1, 5));
      }
    }, 1800);
  }, [state]);

  // Pro壁モーダル
  if (state.showProWall) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 text-white flex items-center justify-center p-6">
        <div className="text-center max-w-lg bg-gray-900/80 backdrop-blur rounded-3xl p-10 shadow-2xl">
          <div className="text-7xl mb-6">🧠</div>
          <h2 className="text-3xl font-bold mb-3">本日の無料分終了</h2>
          <p className="text-gray-400 text-lg mb-2">今日の5問が終わりました</p>
          <p className="text-gray-500 mb-8">Pro版なら<strong className="text-white">無制限</strong>でプレイできます</p>
          <ul className="text-left text-base text-gray-300 mb-8 space-y-3">
            {[
              '🎯 10種類の脳トレゲーム',
              '♾️ 無制限プレイ',
              '📊 認知機能レポート',
              '🤖 難易度AI自動調整',
              '📈 30日間成長グラフ',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-lg">{f}</li>
            ))}
          </ul>
          <Link
            href="/apps/senior-brain/pro"
            className="block w-full bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-500 hover:to-teal-400 text-white font-bold py-5 px-8 rounded-2xl text-xl transition-all shadow-lg"
          >
            ¥680 で Pro を購入（買い切り）
          </Link>
          <p className="mt-4 text-gray-600 text-sm">明日また無料で5問プレイできます</p>
          <Link href="/" className="block mt-4 text-gray-500 text-sm hover:text-white transition-colors">
            ← Hub に戻る
          </Link>
        </div>
      </main>
    );
  }

  // メニュー画面
  if (state.mode === 'menu') {
    const remaining = FREE_DAILY_LIMIT - todayCount;
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 text-white flex flex-col items-center py-10 px-6">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors text-lg">← Hub</Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-3xl font-bold">🧠 シニア向け脳トレ</h1>
          <span className="text-sm bg-white/10 text-gray-400 px-3 py-1 rounded-full">無料版</span>
        </div>

        {/* 今日のスコア */}
        <div className="flex gap-4 mb-8">
          <div className="bg-gray-800/60 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <p className="text-gray-400 text-sm mb-1">今日の正解</p>
            <p className="text-3xl font-bold text-green-400">{state.correct}</p>
          </div>
          <div className="bg-gray-800/60 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <p className="text-gray-400 text-sm mb-1">プレイ回数</p>
            <p className="text-3xl font-bold text-white">{state.total}</p>
          </div>
          <div className="bg-gray-800/60 rounded-2xl px-6 py-4 text-center min-w-[120px]">
            <p className="text-gray-400 text-sm mb-1">残り問題</p>
            <p className={`text-3xl font-bold ${remaining > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {remaining}
            </p>
          </div>
        </div>

        <p className="text-gray-400 text-lg mb-8 text-center">
          {remaining > 0
            ? 'どの脳トレをやりますか？'
            : '本日の無料分は終了しました'}
        </p>

        {/* ゲーム選択 */}
        <div className="grid gap-5 w-full max-w-sm">
          {[
            {
              mode: 'number' as const,
              emoji: '🔢',
              title: '数字記憶',
              desc: '数字の並びを覚えよう',
              color: 'from-blue-600 to-cyan-500',
            },
            {
              mode: 'calc' as const,
              emoji: '➕',
              title: '暗算',
              desc: '計算を素早く解こう',
              color: 'from-orange-600 to-yellow-500',
            },
            {
              mode: 'word' as const,
              emoji: '📝',
              title: '言葉記憶',
              desc: '言葉を順番に覚えよう',
              color: 'from-purple-600 to-pink-500',
            },
          ].map(({ mode, emoji, title, desc, color }) => (
            <button
              key={mode}
              onClick={() => remaining > 0 ? startGame(mode) : setState(s => ({ ...s, showProWall: true }))}
              className={`bg-gradient-to-r ${color} hover:opacity-90 text-white rounded-2xl p-6 text-left transition-all shadow-lg active:scale-95`}
            >
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-2xl font-bold">{title}</div>
              <div className="text-white/80 mt-1">{desc}</div>
            </button>
          ))}
        </div>

        <Link
          href="/apps/senior-brain/pro"
          className="mt-8 text-green-400 text-lg hover:text-green-300 transition-colors underline underline-offset-4"
        >
          ★ Pro版で無制限プレイ（¥680）
        </Link>
      </main>
    );
  }

  // ゲーム画面
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setState(s => ({ ...s, mode: 'menu', phase: 'show' }))}
            className="text-gray-500 hover:text-white text-lg transition-colors"
          >
            ← 戻る
          </button>
          <span className="text-gray-700">/</span>
          <h2 className="text-xl font-bold">
            {state.mode === 'number' && '🔢 数字記憶'}
            {state.mode === 'calc' && '➕ 暗算'}
            {state.mode === 'word' && '📝 言葉記憶'}
          </h2>
          <span className="ml-auto text-sm text-gray-500">
            残り {FREE_DAILY_LIMIT - todayCount} 問
          </span>
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-3xl p-10 shadow-2xl text-center">
          {/* 表示フェーズ */}
          {state.phase === 'show' && (
            <>
              <p className="text-gray-400 text-lg mb-6">
                {state.mode === 'number' && 'この数字を覚えてください'}
                {state.mode === 'word' && 'この言葉を覚えてください'}
              </p>
              <div className="text-6xl font-bold tracking-widest text-white mb-8 leading-relaxed">
                {state.question}
              </div>
              <div className="text-gray-400 text-2xl">
                {state.countdown > 0 && `${state.countdown}秒後に消えます`}
              </div>
            </>
          )}

          {/* 入力フェーズ */}
          {state.phase === 'input' && (
            <>
              <p className="text-gray-400 text-xl mb-8">
                {state.mode === 'number' && '数字を順番に入力してください'}
                {state.mode === 'calc' && state.question}
                {state.mode === 'word' && '覚えた言葉を入力してください（ひらがな）'}
              </p>

              {state.mode === 'number' && (
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setState(s => ({ ...s, userAnswer: s.userAnswer + String(i) }))}
                      className="w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-xl transition-colors active:scale-95"
                    >
                      {i}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-5xl font-bold text-center mb-6 min-h-[60px] tracking-widest">
                {state.userAnswer || <span className="text-gray-700">—</span>}
              </div>

              {(state.mode === 'calc' || state.mode === 'word') && (
                <input
                  type={state.mode === 'calc' ? 'number' : 'text'}
                  value={state.userAnswer}
                  onChange={e => setState(s => ({ ...s, userAnswer: e.target.value }))}
                  placeholder={state.mode === 'calc' ? '答えを入力' : 'ひらがなで入力'}
                  className="w-full bg-gray-800 border border-gray-600 rounded-2xl px-6 py-5 text-3xl text-white text-center focus:outline-none focus:border-green-500 mb-6"
                  autoFocus
                />
              )}

              <div className="flex gap-3 justify-center">
                {state.mode === 'number' && (
                  <button
                    onClick={() => setState(s => ({ ...s, userAnswer: s.userAnswer.slice(0, -1) }))}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl text-xl transition-colors"
                  >
                    ⌫ 消す
                  </button>
                )}
                <button
                  onClick={submitAnswer}
                  disabled={!state.userAnswer}
                  className="bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-500 hover:to-teal-400 disabled:opacity-40 text-white font-bold px-12 py-4 rounded-2xl text-xl transition-all"
                >
                  答える
                </button>
              </div>
            </>
          )}

          {/* フィードバックフェーズ */}
          {state.phase === 'feedback' && (
            <>
              <div className={`text-8xl mb-6 ${feedback === 'correct' ? 'animate-bounce' : ''}`}>
                {feedback === 'correct' ? '⭕' : '❌'}
              </div>
              <p className={`text-3xl font-bold mb-4 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {feedback === 'correct' ? '正解！' : '不正解'}
              </p>
              {feedback === 'wrong' && (
                <p className="text-gray-400 text-xl">
                  答えは <span className="text-white font-bold">{state.answer}</span> でした
                </p>
              )}
              <p className="text-gray-500 mt-4">
                正解数: {state.correct} / {state.total}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
