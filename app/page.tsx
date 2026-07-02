'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APPS, getCategoryLabel, type AppConfig } from '@/lib/apps-config';

const CATEGORIES = ['all', 'game', 'tool', 'wellness', 'training'] as const;
type Filter = typeof CATEGORIES[number];

const filterLabel: Record<Filter, string> = {
  all: '全て',
  game: 'ゲーム',
  tool: 'ツール',
  wellness: 'ウェルネス',
  training: 'トレーニング',
};

export default function HubPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? APPS : APPS.filter(a => a.category === filter);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="text-center py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="inline-block bg-pro-500/20 text-pro-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-pro-500/30">
          🎮 {APPS.length}本のミニアプリ集
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          <span className="text-white">Micro</span>
          <span className="bg-gradient-to-r from-brand-400 to-pro-400 bg-clip-text text-transparent">Apps</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-xl mx-auto mb-8">
          テトリス・将棋・脳トレなど全{APPS.length}本。<br />
          無料で試して、気に入ったら<span className="text-pro-400 font-semibold">買い切り Pro</span>へ。
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="#apps"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
          >
            アプリを見る
          </Link>
          <Link
            href="/auth/signup"
            className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            無料アカウント作成
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'アプリ数', value: `${APPS.length}本` },
            { label: '最安値', value: '¥380〜' },
            { label: '買い切り', value: '永久利用' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filter */}
      <section id="apps" className="max-w-6xl mx-auto px-4 pt-12 pb-4">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {filterLabel[cat]}
            </button>
          ))}
        </div>
      </section>

      {/* App Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center text-gray-600 text-sm">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <Link href="/legal/tokusho" className="hover:text-gray-400 transition-colors">
            特定商取引法に基づく表記
          </Link>
          <Link href="/legal/privacy" className="hover:text-gray-400 transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/legal/terms" className="hover:text-gray-400 transition-colors">
            利用規約
          </Link>
          <a
            href="mailto:hiroshi.takizawa@digitalidentity.co.jp"
            className="hover:text-gray-400 transition-colors"
          >
            お問い合わせ
          </a>
        </div>
        <p>© 2026 MicroApps Hub — Powered by Next.js + Stripe + Supabase</p>
        <p className="mt-1 text-xs text-gray-700">
          決済処理: Stripe, Inc. ／ 認証・DB: Supabase, Inc.
        </p>
      </footer>
    </main>
  );
}

function AppCard({ app }: { app: AppConfig }) {
  return (
    <div className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all group">
      {/* Card header */}
      <div className={`h-24 bg-gradient-to-br ${app.color} flex items-center justify-center text-5xl`}>
        {app.emoji}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-bold text-white text-lg">{app.title}</h2>
          <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
            {getCategoryLabel(app.category)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4">{app.description}</p>

        {/* Free features preview */}
        <ul className="text-xs text-gray-400 mb-4 space-y-1">
          {app.freeFeatures.slice(0, 2).map(f => (
            <li key={f} className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> {f}
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-pro-400">
            <span>★</span> Pro: {app.proFeatures[0]}…
          </li>
        </ul>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/apps/${app.slug}`}
            className="flex-1 text-center bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            無料で遊ぶ
          </Link>
          <Link
            href={`/apps/${app.slug}/pro`}
            className="flex-1 text-center bg-gradient-to-r from-pro-600 to-pro-500 hover:from-pro-500 hover:to-pro-400 text-white text-sm font-bold py-2 rounded-xl transition-all"
          >
            ¥{app.price.toLocaleString()} Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
