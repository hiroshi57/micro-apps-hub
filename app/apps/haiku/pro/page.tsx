export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CheckoutButton } from '@/app/components/CheckoutButton';
import { createClient } from '@/lib/supabase/server';
import { hasPurchased } from '@/lib/purchases';

export default async function ProPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;
  const purchased = user ? await hasPurchased(user.id, 'haiku') : false;
  const justPurchased = params.success === '1';

  if (!user) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="text-3xl font-bold mb-3">ログインが必要です</h1>
        <p className="text-gray-400 mb-6">Pro版を購入・利用するにはアカウントが必要です。</p>
        <Link href="/auth/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-full transition-colors">ログイン / 新規登録</Link>
      </div>
    </main>
  );

  if (!purchased) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="text-3xl font-bold mb-2">俳句ジェネレーター Pro</h1>
        <ul className="text-left text-sm text-gray-300 mb-8 space-y-2">
          <li className="flex items-center gap-2"><span className="text-pro-400">★</span> 無限生成</li>
          <li className="flex items-center gap-2"><span className="text-pro-400">★</span> 季語500+</li>
          <li className="flex items-center gap-2"><span className="text-pro-400">★</span> テーマ指定</li>
          <li className="flex items-center gap-2"><span className="text-pro-400">★</span> SNS画像出力</li>
          <li className="flex items-center gap-2"><span className="text-pro-400">★</span> お気に入り</li>
          <li className="flex items-center gap-2"><span className="text-pro-400">★</span> 永久利用・買い切り</li>
        </ul>
        <CheckoutButton appSlug="haiku" price={380} />
        <Link href="/apps/haiku" className="block mt-3 text-gray-500 text-sm hover:text-white">無料版に戻る</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">
      {justPurchased && <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm">🎉 購入ありがとうございます！全機能が解放されました。</div>}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🌸 俳句ジェネレーター Pro</h1>
        <span className="bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
      </div>
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">🌸</div>
        <div className="grid gap-3">
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">★</span> 無限生成</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">★</span> 季語500+</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">★</span> テーマ指定</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">★</span> SNS画像出力</div>
          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">★</span> お気に入り</div>
        </div>
      </div>
    </main>
  );
}
