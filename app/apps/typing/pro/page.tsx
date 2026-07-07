export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CheckoutButton } from '@/app/components/CheckoutButton';
import { createClient } from '@/lib/supabase/server';
import { hasPurchased } from '@/lib/purchases';

export default async function TypingProPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const purchased = user ? await hasPurchased(user.id, 'typing') : false;
  const justPurchased = params.success === '1';

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-3">ログインが必要です<span className="block text-base text-gray-500 mt-1" lang="en">Login required</span></h1>
          <p className="text-gray-400 mb-6">Pro版を購入・利用するにはアカウントが必要です。<span className="block text-sm text-gray-600 mt-1" lang="en">You need a (free) account to buy and use Pro.</span></p>
          <Link href="/auth/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-full transition-colors">
            ログイン・新規登録 / Log in · Sign up
          </Link>
        </div>
      </main>
    );
  }

  if (!purchased) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">⌨️</div>
          <h1 className="text-3xl font-bold mb-2">タイピング練習 Pro</h1>
          <p className="text-gray-400 mb-6">英語・プログラミング・漢字まで網羅した本格タイピング</p>
          <ul className="text-left text-sm text-gray-300 mb-8 space-y-2">
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> 英語・プログラミング・漢字</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> 単語1000語+</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> 成長グラフ</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">\u2605</span> オリジナル文章登録</li>
            <li className="flex items-center gap-2"><span className="text-pro-400">&#9733;</span> 永久利用・買い切り</li>
          </ul>
          <CheckoutButton appSlug="typing" price={580} />
          <Link href="/apps/typing" className="block mt-3 text-gray-500 text-sm hover:text-white transition-colors">
            無料版に戻る / Back to free version
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      {justPurchased && (
        <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm">
          🎉 購入ありがとうございます！全機能が解放されました。 / Thank you — everything is unlocked!
        </div>
      )}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">⌨️ タイピング練習 Pro</h1>
        <span className="bg-gradient-to-r from-slate-600 to-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
      </div>
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">
          ⌨️
        </div>
        <p className="text-gray-400 mb-8">英語・プログラミング・漢字まで網羅した本格タイピング</p>
        <div className="grid gap-3">
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> 英語・プログラミング・漢字</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> 単語1000語+</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> 成長グラフ</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\u2605</span> オリジナル文章登録</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">&#9733;</span> 永久利用・買い切り</div>
        </div>
      </div>
    </main>
  );
}
