'use client';
/**
 * app/components/TrialBanner.tsx — T-016 無料トライアルバナー
 *
 * 使用例（ダッシュボード等に配置）:
 *   <TrialBanner />
 *
 * - 未使用 & 非 Pro → 「7日間無料トライアル」ボタン表示
 * - トライアル中   → 残り日数バッジ表示
 * - 使用済み      → 何も表示しない
 */

import { useEffect, useState } from 'react';

interface TrialStatus {
  is_pro:         boolean;
  trial_used:     boolean;
  trial_active:   boolean;
  trial_expired:  boolean;
  trial_ends_at:  string | null;
  remaining_days: number;
  can_start_trial: boolean;
}

export default function TrialBanner() {
  const [status, setStatus]   = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/trial')
      .then(r => r.ok ? r.json() : null)
      .then(data => setStatus(data))
      .finally(() => setLoading(false));
  }, []);

  const startTrial = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/trial', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setStatus(prev =>
          prev
            ? {
                ...prev,
                trial_active: true,
                trial_used: true,
                remaining_days: data.remaining_days,
                trial_ends_at: data.trial_ends_at,
                can_start_trial: false,
              }
            : prev
        );
      } else {
        setMessage(data.error ?? 'エラーが発生しました');
      }
    } catch {
      setMessage('通信エラーが発生しました');
    } finally {
      setStarting(false);
    }
  };

  // ローディング中・Pro済み・試用済みで期限切れ → 非表示
  if (loading || !status) return null;
  if (status.is_pro) return null;
  if (status.trial_used && !status.trial_active) return null;

  // トライアル中 → 残り日数バッジ
  if (status.trial_active) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm">
        <span className="text-xl">⏱</span>
        <div>
          <p className="font-semibold text-cyan-300">
            Pro トライアル中 — 残り {status.remaining_days} 日
          </p>
          <p className="text-gray-400">
            期限:{' '}
            {status.trial_ends_at
              ? new Date(status.trial_ends_at).toLocaleDateString('ja-JP')
              : ''}
          </p>
        </div>
        <a
          href="/dashboard#upgrade"
          className="ml-auto rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-bold text-gray-900 hover:bg-cyan-300 transition"
        >
          Pro へアップグレード
        </a>
      </div>
    );
  }

  // トライアル未使用 → 開始ボタン
  if (status.can_start_trial) {
    return (
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-4 text-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-semibold text-yellow-300">7日間 Pro 無料トライアル</p>
              <p className="text-gray-400">
                クレジットカード不要。期間中は全機能（ランキング・テーマ・BGM）が使えます。
              </p>
            </div>
          </div>
          <button
            onClick={startTrial}
            disabled={starting}
            className="ml-auto rounded-xl bg-yellow-400 px-6 py-2 font-bold text-gray-900 transition hover:bg-yellow-300 disabled:opacity-60 whitespace-nowrap"
          >
            {starting ? '開始中…' : '無料で試す →'}
          </button>
        </div>
        {message && (
          <p className="mt-2 text-center text-xs text-green-400">{message}</p>
        )}
      </div>
    );
  }

  return null;
}
