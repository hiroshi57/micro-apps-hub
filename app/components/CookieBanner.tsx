'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'ma-cookie-consent-v1';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_KEY);
      if (!saved) setShow(true);
    } catch {
      // localStorage が利用不可な場合は表示しない
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    } catch {}
    setShow(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ accepted: false, at: new Date().toISOString() }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 shadow-2xl"
      role="dialog"
      aria-label="Cookie 同意"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-300 leading-relaxed">
          <span className="text-lg mr-2">🍪</span>
          当サービスでは、ゲームの記録保存・ログイン維持・サービス改善のために
          Cookie および localStorage を使用しています。
          詳しくは{' '}
          <Link href="/legal/privacy" className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors">
            プライバシーポリシー
          </Link>
          をご覧ください。
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-colors"
          >
            必要最低限のみ
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors"
          >
            すべて同意する
          </button>
        </div>
      </div>
    </div>
  );
}
