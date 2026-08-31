'use client';
/**
 * app/components/Rankings.tsx — T-097 オンラインランキング表示コンポーネント
 *
 * 使用例:
 *   <Rankings slug="tetris" />
 *
 * - 上位20件をリアルタイム取得（30秒ポーリング）
 * - 自分のスコアを POST して即時更新
 * - Pro 以外は「Pro プランで参加」バナーを表示
 */

import { useEffect, useState, useCallback } from 'react';

interface RankEntry {
  rank:         number;
  id:           string;
  display_name: string | null;
  score:        number;
  level:        number | null;
  duration_ms:  number | null;
  played_at:    string;
}

interface RankingsProps {
  slug: 'tetris' | 'sudoku' | 'typing';
  /** Pro ユーザーなら true（親コンポーネントから渡す） */
  isPro?: boolean;
  /** 登録するスコア（ゲーム終了後に set） */
  pendingScore?: { score: number; level?: number; duration_ms?: number } | null;
  /** スコア登録完了後のコールバック */
  onScoreSubmitted?: () => void;
}

const SLUG_LABEL: Record<string, string> = {
  tetris:  'テトリス',
  sudoku:  '数独',
  typing:  'タイピング',
};

function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}分${s % 60}秒` : `${s}秒`;
}

export default function Rankings({
  slug,
  isPro = false,
  pendingScore,
  onScoreSubmitted,
}: RankingsProps) {
  const [entries, setEntries]   = useState<RankEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // ── ランキング取得 ─────────────────────────────────────────────
  const fetchRankings = useCallback(async () => {
    try {
      const res = await fetch(`/api/rankings?slug=${slug}&limit=20`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEntries(data.rankings ?? []);
      setError(null);
    } catch (e) {
      setError('ランキングの取得に失敗しました');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRankings();
    const timer = setInterval(fetchRankings, 30_000);
    return () => clearInterval(timer);
  }, [fetchRankings]);

  // ── スコア登録 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingScore || !isPro || submitted) return;

    const submit = async () => {
      setSubmitting(true);
      try {
        const res = await fetch('/api/rankings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...pendingScore }),
        });
        if (res.ok) {
          setSubmitted(true);
          onScoreSubmitted?.();
          await fetchRankings();
        }
      } catch (e) {
        console.error('[rankings submit]', e);
      } finally {
        setSubmitting(false);
      }
    };

    submit();
  }, [pendingScore, isPro, submitted, slug, fetchRankings, onScoreSubmitted]);

  // ── 非Pro バナー ──────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
        <div className="mb-2 text-2xl">🏆</div>
        <p className="font-semibold text-yellow-300">オンラインランキングは Pro プラン専用</p>
        <p className="mt-1 text-sm text-gray-400">
          月額 ¥480 で全機能を解放。トライアルなら7日間無料。
        </p>
        <a
          href="/apps/tetris#pro"
          className="mt-4 inline-block rounded-xl bg-yellow-400 px-6 py-2 text-sm font-bold text-gray-900 transition hover:bg-yellow-300"
        >
          Pro プランを見る →
        </a>
      </div>
    );
  }

  // ── ローディング ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400">
        ランキングを読み込み中…
      </div>
    );
  }

  // ── エラー ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
        {error}
        <button
          onClick={fetchRankings}
          className="ml-3 underline hover:text-white"
        >
          再試行
        </button>
      </div>
    );
  }

  // ── ランキングテーブル ────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold">🏆 {SLUG_LABEL[slug]} ランキング</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {submitting && <span className="animate-pulse">スコア登録中…</span>}
          {submitted && <span className="text-green-400">✓ 登録済み</span>}
          <button onClick={fetchRankings} className="hover:text-white transition">
            ↺ 更新
          </button>
        </div>
      </div>

      {/* テーブル */}
      {entries.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          まだスコアがありません。最初の記録を作ろう！
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400">
              <th className="px-4 py-2 text-left">順位</th>
              <th className="px-4 py-2 text-left">プレイヤー</th>
              <th className="px-4 py-2 text-right">スコア</th>
              <th className="hidden px-4 py-2 text-right sm:table-cell">時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className={`transition hover:bg-white/5 ${entry.rank <= 3 ? 'font-semibold' : ''}`}
              >
                <td className="px-4 py-2 text-gray-300">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}位`}
                </td>
                <td className="px-4 py-2 text-white">
                  {entry.display_name ?? '名無し'}
                  {entry.level && <span className="ml-2 text-xs text-gray-500">Lv.{entry.level}</span>}
                </td>
                <td className="px-4 py-2 text-right font-mono text-cyan-300">
                  {entry.score.toLocaleString()}
                </td>
                <td className="hidden px-4 py-2 text-right text-gray-400 sm:table-cell">
                  {formatDuration(entry.duration_ms)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
