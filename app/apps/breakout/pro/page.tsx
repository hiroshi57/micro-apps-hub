export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CheckoutButton } from '@/app/components/CheckoutButton';
import { createClient } from '@/lib/supabase/server';
import { hasPurchased } from '@/lib/purchases';

export default async function BreakoutProPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const purchased = user ? await hasPurchased(user.id, 'breakout') : false;
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
          <div className="text-6xl mb-4">🏓</div>
          <h1 className="text-3xl font-bold mb-2">ブロック崩し Pro</h1>
          <p className="text-gray-400 mb-6">50ステージ・パワーアップ搭載の完全版ブロック崩し</p>
          <ul className="text-left text-sm text-gray-300 mb-8 space-y-2">
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> 50ステージ</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> パワーアップアイテム 8種</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> BGM 5種類</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> カスタムボール・パドル</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">&#9733;</span> 永久利用・買い切り</li>
          </ul>
          <CheckoutButton appSlug="breakout" price={480} />
          <Link href="/apps/breakout" className="block mt-3 text-gray-500 text-sm hover:text-white transition-colors">
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
        <h1 className="text-2xl font-bold">🏓 ブロック崩し Pro</h1>
        <span className="bg-gradient-to-r from-purple-600 to-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
      </div>
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">
          🏓
        </div>
        <p className="text-gray-400 mb-8">50ステージ・パワーアップ搭載の完全版ブロック崩し</p>
        <div className="grid gap-3">
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> 50ステージ</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> パワーアップアイテム 8種</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> BGM 5種類</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> カスタムボール・パドル</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">&#9733;</span> 永久利用・買い切り</div>
        </div>
      </div>
    </main>
  );
}
