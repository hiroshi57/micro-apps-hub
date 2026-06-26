'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  appSlug: string;
  price: number;
  label?: string;
  className?: string;
}

export function CheckoutButton({
  appSlug,
  price,
  label,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appSlug }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? '決済セッションの作成に失敗しました');
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading}
          className={
            className ??
            'w-full bg-gradient-to-r from-pro-600 to-pro-500 hover:from-pro-500 hover:to-pro-400 disabled:opacity-60 text-white font-bold py-4 px-8 rounded-full text-lg transition-all shadow-lg'
          }
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              処理中...
            </span>
          ) : (
            label ?? `¥${price.toLocaleString()} で Pro を購入（買い切り）`
          )}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
