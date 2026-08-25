/**
 * /lp/tetris — テトリス SEO ランディングページ (T-039)
 *
 * 目的: Google 検索「テトリス 無料」「テトリス オンライン」からの流入獲得。
 * 構成: Hero → 特徴 → 無料 vs Pro 比較 → FAQ → CTA
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqJsonLd } from '@/app/components/JsonLd';

// ─── SEO Metadata ──────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '無料テトリス | ブラウザで即プレイ — MicroAppsHub',
  description:
    'ブラウザで今すぐ遊べる無料テトリス。インストール不要・会員登録不要でレベル1〜5が無料。Pro版でレベル20・オンラインランキング・10種テーマ・BGMを解放。',
  keywords: [
    'テトリス', '無料', 'オンライン', 'ブラウザ', 'ゲーム',
    'tetris', 'free', 'online', 'browser game', 'パズル',
  ],
  alternates: { canonical: 'https://micro-apps-hub-seven.vercel.app/lp/tetris' },
  openGraph: {
    title: '無料テトリス | ブラウザで即プレイ',
    description: 'インストール不要・登録不要。今すぐ遊べるブラウザ版テトリス。',
    url: 'https://micro-apps-hub-seven.vercel.app/lp/tetris',
    siteName: 'MicroAppsHub',
    images: [{ url: '/og?title=無料テトリス&emoji=🧱', width: 1200, height: 630 }],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '無料テトリス | ブラウザで即プレイ',
    description: 'インストール不要。今すぐ遊べるブラウザ版テトリス。',
  },
};

// ─── FAQ データ ────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'テトリスは本当に無料で遊べますか？',
    a: 'はい。レベル1〜5、スタンダードテーマ、ハイスコア記録はすべて無料でご利用いただけます。会員登録・インストールも不要です。',
  },
  {
    q: 'スマートフォンでも遊べますか？',
    a: 'はい。iOS・Android の標準ブラウザ（Safari・Chrome）に対応しています。タッチ操作（スワイプ・タップ）でプレイできます。',
  },
  {
    q: 'Pro版にするとどう変わりますか？',
    a: 'レベルが最大20まで解放され、10種類のテーマ・5種類のBGM・オンラインランキング機能が使えるようになります。月額480円（税込）です。',
  },
  {
    q: 'ハイスコアはどこに保存されますか？',
    a: '無料版はブラウザのローカルストレージに保存されます。Pro版はクラウドに保存され、デバイスをまたいで記録が引き継がれます。',
  },
  {
    q: '操作方法を教えてください。',
    a: 'PC: ← → で横移動、↑ で回転、↓ でソフトドロップ、スペースでハードドロップ。スマホ: 左右スワイプで移動、上スワイプで回転、下スワイプでドロップ。',
  },
];

// ─── Feature 定義 ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '⚡',
    title: 'インストール不要',
    desc: 'ブラウザを開くだけで即プレイ。アプリのダウンロードは一切不要です。',
  },
  {
    icon: '📱',
    title: 'マルチデバイス対応',
    desc: 'PC・スマホ・タブレット。どのデバイスからでも同じ品質で楽しめます。',
  },
  {
    icon: '🏆',
    title: 'ハイスコア記録',
    desc: '自己ベストを自動保存。Pro版ではオンラインランキングで世界中と競えます。',
  },
  {
    icon: '🎨',
    title: '豊富なテーマ',
    desc: 'スタンダードテーマは無料。Pro版で10種類のテーマから選べます。',
  },
  {
    icon: '🎵',
    title: 'BGM対応',
    desc: 'Pro版では5種類のBGMを切り替えながらプレイできます。',
  },
  {
    icon: '🔒',
    title: 'セキュア',
    desc: 'Stripe決済で安全購入。個人情報は最小限しか収集しません。',
  },
];

// ─── Page Component ────────────────────────────────────────────────────────

export default function TetrisLandingPage() {
  return (
    <>
      <FaqJsonLd faqs={FAQS} />

      <main className="min-h-screen bg-gray-950 text-white">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 py-24 text-center">
          {/* 背景グラデーション */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-900/30 via-transparent to-transparent"
          />

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 text-8xl">🧱</div>
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
              無料テトリス
            </h1>
            <p className="mb-2 text-xl text-gray-300">
              ブラウザで今すぐ遊べる。インストール不要・登録不要。
            </p>
            <p className="mb-10 text-base text-gray-400">
              レベル1〜5 完全無料 | Pro版でレベル20・ランキング・BGM解放
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/apps/tetris"
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90 hover:scale-105"
              >
                🎮 今すぐ無料でプレイ
              </Link>
              <Link
                href="/apps/tetris#pro"
                className="rounded-2xl border border-white/20 bg-white/10 px-10 py-4 text-lg font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Pro版を見る ¥480/月
              </Link>
            </div>

            {/* 信頼バッジ */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <span>✅ 完全無料で開始</span>
              <span>✅ クレジットカード不要</span>
              <span>✅ いつでもキャンセル可</span>
            </div>
          </div>
        </section>

        {/* ── プレビュー（擬似ゲーム画面） ────────────────────── */}
        <section className="px-4 py-8">
          <div className="mx-auto max-w-xs">
            <div className="rounded-2xl border border-white/10 bg-gray-900 p-4 shadow-2xl">
              {/* ゲームボード擬似表示 */}
              <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
                <span>SCORE</span><span className="font-mono text-white">12,840</span>
              </div>
              <div className="grid grid-cols-10 gap-px rounded bg-gray-800 p-1">
                {Array.from({ length: 200 }).map((_, i) => {
                  const filledRows = [170, 171, 172, 173, 174, 175, 176, 177, 178, 179,
                                      180, 181, 182, 183, 184, 185, 186, 187, 188, 189,
                                      150, 151, 152, 153, 154, 155, 156, 157, 158,
                                      130, 131, 132, 133, 134, 135, 136,
                                      35, 36, 44, 45];
                  const colors = ['bg-cyan-400', 'bg-blue-500', 'bg-orange-400',
                                  'bg-yellow-300', 'bg-green-400', 'bg-purple-400', 'bg-red-400'];
                  const filled = filledRows.includes(i);
                  const color = filled ? colors[i % colors.length] : 'bg-gray-700';
                  return <div key={i} className={`h-3 rounded-sm ${color} opacity-90`} />;
                })}
              </div>
              <div className="mt-3 text-center text-xs text-gray-400">レベル 5 | NEXT: 🟦</div>
            </div>
          </div>
        </section>

        {/* ── 特徴 ─────────────────────────────────────────────── */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              なぜ MicroAppsHub のテトリスを選ぶの？
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-blue-500/40 hover:bg-white/8"
                >
                  <div className="mb-3 text-3xl">{f.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 無料 vs Pro 比較表 ───────────────────────────────── */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-3xl font-bold">プランを比較する</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left font-semibold text-gray-300">機能</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-300">無料</th>
                    <th className="px-6 py-4 text-center font-semibold text-cyan-400">
                      Pro ¥480/月
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['レベル上限',        'レベル5',    'レベル20'],
                    ['テーマ',           '1種類',      '10種類'],
                    ['BGM',              '—',          '5種類'],
                    ['ハイスコード保存', '◯ ローカル', '◯ クラウド'],
                    ['オンランキング',   '—',          '◯'],
                    ['広告',            'あり',        'なし'],
                  ].map(([feat, free, pro]) => (
                    <tr key={feat} className="hover:bg-white/3">
                      <td className="px-6 py-3 text-gray-300">{feat}</td>
                      <td className="px-6 py-3 text-center text-gray-400">{free}</td>
                      <td className="px-6 py-3 text-center font-medium text-cyan-300">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/apps/tetris"
                className="inline-block rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-12 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90 hover:scale-105"
              >
                🎮 無料でプレイを始める
              </Link>
              <p className="mt-3 text-xs text-gray-500">
                クレジットカード不要 · いつでもキャンセル可
              </p>
            </div>
          </div>
        </section>

        {/* ── 操作方法 ─────────────────────────────────────────── */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-3xl font-bold">操作方法</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-lg font-semibold">💻 PC・キーボード</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">←</kbd><kbd className="ml-1 rounded bg-white/10 px-2 py-0.5 font-mono text-white">→</kbd> 横移動</li>
                  <li><kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">↑</kbd> 回転</li>
                  <li><kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">↓</kbd> ソフトドロップ</li>
                  <li><kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">Space</kbd> ハードドロップ</li>
                  <li><kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">P</kbd> 一時停止</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-lg font-semibold">📱 スマホ・タッチ</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>👈 左スワイプ — 左移動</li>
                  <li>👉 右スワイプ — 右移動</li>
                  <li>👆 上スワイプ — 回転</li>
                  <li>👇 下スワイプ — ソフトドロップ</li>
                  <li>👆 ダブルタップ — ハードドロップ</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-3xl font-bold">よくある質問</h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition open:border-blue-500/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                    {faq.q}
                    <span className="ml-4 text-gray-400 transition group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="px-4 py-24 text-center">
          <div className="mx-auto max-w-xl">
            <div className="mb-4 text-6xl">🎮</div>
            <h2 className="mb-4 text-4xl font-extrabold">さあ、プレイしよう</h2>
            <p className="mb-8 text-gray-400">
              登録不要・0円で今すぐ始められます。
            </p>
            <Link
              href="/apps/tetris"
              className="inline-block rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-12 py-4 text-xl font-bold text-white shadow-lg transition hover:opacity-90 hover:scale-105"
            >
              無料でテトリスを始める →
            </Link>
          </div>
        </section>

        {/* ── Footer nav ───────────────────────────────────────── */}
        <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-gray-500">
          <nav className="mb-2 flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-white transition">ホーム</Link>
            <Link href="/apps/tetris" className="hover:text-white transition">テトリスをプレイ</Link>
            <Link href="/legal/privacy" className="hover:text-white transition">プライバシー</Link>
            <Link href="/legal/terms" className="hover:text-white transition">利用規約</Link>
          </nav>
          <p>© 2025 MicroAppsHub — ブラウザで遊べるミニゲーム集</p>
        </footer>
      </main>
    </>
  );
}
