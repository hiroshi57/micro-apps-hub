export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { hasPurchased } from '@/lib/purchases';
import { CheckoutButton } from '@/app/components/CheckoutButton';

const PRO_FEATURES = [
  'レベル 1〜20（無制限）',
  '10種類のカラーテーマ',
  'オンラインランキング',
  'BGM 5種類',
  '永久利用・買い切り',
];

export default async function TetrisProPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const purchased = user ? await hasPurchased(user.id, 'tetris') : false;
  const justPurchased = params.success === '1';

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-3">ログインが必要です</h1>
          <p className="text-gray-400 mb-6">Pro版を購入・利用するにはアカウントが必要です。</p>
          <Link href="/auth/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-full transition-colors">
            ログイン / 新規登録
          </Link>
        </div>
      </main>
    );
  }

  if (!purchased) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🧱</div>
          <h1 className="text-3xl font-bold mb-2">テトリス Pro</h1>
          <p className="text-gray-400 mb-6">レベル上限なし・10テーマ・オンランキング搭載の完全版</p>
          <div className="grid gap-3 mb-8">
            {PRO_FEATURES.map(f => (
              <div key={f} className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2">
                <span className="text-pro-400">★</span> {f}
              </div>
            ))}
          </div>
          <CheckoutButton appSlug="tetris" price={480} />
          <Link href="/apps/tetris" className="block mt-3 text-gray-500 text-sm hover:text-white transition-colors">
            無料版に戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      {justPurchased && (
        <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm">
          🎉 購入ありがとうございます！全機能が解放されました。
        </div>
      )}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🧱 テトリス Pro</h1>
        <span className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
      </div>
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">🧱</div>
        <p className="text-gray-400 mb-8">全20レベル解放済み。最高難度への挑戦を楽しんでください。</p>
        <div className="grid gap-3 mb-8">
          {PRO_FEATURES.map(f => (
            <div key={f} className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2">
              <span className="text-pro-400">★</span> {f}
            </div>
          ))}
        </div>
        <Link
          href="/apps/tetris"
          className="inline-block bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          テトリスをプレイ →
        </Link>
      </div>
    </main>
  );
}
