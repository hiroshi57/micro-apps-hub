export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CheckoutButton } from '@/app/components/CheckoutButton';
import { createClient } from '@/lib/supabase/server';
import { hasPurchased } from '@/lib/purchases';

export default async function SeniorBrainProPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const purchased = user ? await hasPurchased(user.id, 'senior-brain') : false;
  const justPurchased = params.success === '1';

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-7xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-3">ログインが必要です</h1>
          <p className="text-gray-400 text-lg mb-8">Pro版を購入・利用するにはアカウントが必要です。</p>
          <Link
            href="/auth/login"
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-full text-lg transition-colors"
          >
            ログイン / 新規登録
          </Link>
        </div>
      </main>
    );
  }

  if (!purchased) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-lg p-8">
          <div className="text-7xl mb-6">🧠</div>
          <h1 className="text-4xl font-bold mb-3">シニア向け脳トレ Pro</h1>
          <p className="text-gray-400 text-lg mb-8">
            毎日の認知機能トレーニングで<br />
            <span className="text-white font-semibold">健康な脳を維持しましょう</span>
          </p>
          <ul className="text-left text-lg text-gray-300 mb-10 space-y-4">
            {[
              ['🎯', '10種類の脳トレゲーム（数字・言葉・計算・空間・注意力）'],
              ['♾️', '無制限プレイ — 毎日何問でも'],
              ['🤖', 'AI難易度自動調整 — あなたのペースで上達'],
              ['📊', '認知機能レポート — 5項目の分析'],
              ['📈', '30日間成長グラフ — 上達が目に見える'],
              ['🏆', 'ご家族への進捗共有機能'],
              ['💳', '永久利用・買い切り'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <CheckoutButton appSlug="senior-brain" price={680} />
          <Link
            href="/apps/senior-brain"
            className="block mt-4 text-gray-500 text-base hover:text-white transition-colors"
          >
            無料版に戻る（1日5問まで）
          </Link>
        </div>
      </main>
    );
  }

  // === Pro コンテンツ（購入済み）===
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-gray-950 text-white flex flex-col items-center py-10 px-6">
      {justPurchased && (
        <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-3 rounded-full text-lg">
          🎉 ご購入ありがとうございます！全機能が解放されました。
        </div>
      )}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white text-lg">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-3xl font-bold">🧠 シニア向け脳トレ Pro</h1>
        <span className="bg-gradient-to-r from-green-600 to-teal-500 text-white text-sm font-bold px-3 py-1 rounded-full">PRO</span>
      </div>

      {/* ゲーム選択グリッド */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {[
          { emoji: '🔢', title: '数字記憶', desc: '数列を覚える', color: 'from-blue-700 to-cyan-600' },
          { emoji: '➕', title: '暗算', desc: '素早く計算', color: 'from-orange-700 to-yellow-600' },
          { emoji: '📝', title: '言葉記憶', desc: '単語を記憶', color: 'from-purple-700 to-pink-600' },
          { emoji: '🗺️', title: '空間認識', desc: '図形を把握', color: 'from-teal-700 to-green-600' },
          { emoji: '👀', title: '注意力テスト', desc: '違いを見つける', color: 'from-red-700 to-orange-600' },
          { emoji: '🔤', title: '文字並べ', desc: 'アナグラム解き', color: 'from-indigo-700 to-blue-600' },
          { emoji: '🎵', title: '音記憶', desc: 'リズムを再現', color: 'from-pink-700 to-rose-600' },
          { emoji: '🎨', title: '色識別', desc: '色の違いを判別', color: 'from-fuchsia-700 to-purple-600' },
          { emoji: '⏱️', title: '時間感覚', desc: '時間を当てる', color: 'from-amber-700 to-yellow-600' },
          { emoji: '🧩', title: 'パターン認識', desc: '規則を見つける', color: 'from-emerald-700 to-teal-600' },
        ].map(({ emoji, title, desc, color }) => (
          <Link
            key={title}
            href={`/apps/senior-brain?game=${encodeURIComponent(title)}`}
            className={`bg-gradient-to-r ${color} hover:opacity-90 text-white rounded-2xl p-6 text-left transition-all shadow-lg active:scale-95`}
          >
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="text-xl font-bold">{title}</div>
            <div className="text-white/70 text-sm mt-1">{desc}</div>
          </Link>
        ))}
      </div>

      {/* 認知機能レポート（ダミー） */}
      <div className="w-full max-w-2xl bg-gray-900/60 rounded-3xl p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">📊 今月の認知機能レポート</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: '記憶力', value: 82, color: 'bg-blue-500' },
            { label: '計算力', value: 76, color: 'bg-orange-500' },
            { label: '注意力', value: 68, color: 'bg-purple-500' },
            { label: '空間認識', value: 71, color: 'bg-teal-500' },
            { label: '言語力', value: 88, color: 'bg-pink-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="relative w-full h-32 bg-gray-800 rounded-xl overflow-hidden mb-2">
                <div
                  className={`absolute bottom-0 left-0 right-0 ${color} rounded-b-xl transition-all`}
                  style={{ height: `${value}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                  {value}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-600 text-sm">
        ゲームをプレイするとレポートが更新されます
      </p>
    </main>
  );
}
