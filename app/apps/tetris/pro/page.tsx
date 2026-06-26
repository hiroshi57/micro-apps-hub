export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { hasPurchased } from '@/lib/purchases';

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
          <ul className="text-left text-sm text-gray-300 mb-8 space-y-2">
            {['レベル 1〜20 (無制限)', '10種類のカラーテーマ', 'オンラインランキング', 'BGM 5種類', '永久利用・買い切り'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-pro-400">★</span> {f}
              </li>
            ))}
          </ul>
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
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">🧱 テトリス Pro</h1>
        <span className="pro-badge">PRO</span>
      </div>
      <p className="text-gray-400 text-sm">全20レベル解放済み — こちらにフルゲームを実装します</p>
      {/* TODO: Pro版ゲームコンポーネント（レベル20・テーマ選択・BGM） */}
      <div className="mt-8 text-6xl animate-pulse">🧱</div>
      <p className="text-gray-600 mt-4 text-sm">Pro ゲームロード中…</p>
    </main>
  );
}

function CheckoutButton({ appSlug, price }: { appSlug: string; price: number }) {
  return (
    <form action="/api/stripe/checkout" method="POST">
      <input type="hidden" name="appSlug" value={appSlug} />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-pro-600 to-pro-500 hover:from-pro-500 hover:to-pro-400 text-white font-bold py-4 px-8 rounded-full text-lg transition-all"
      >
        ¥{price.toLocaleString()} で Pro を購入（買い切り）
      </button>
    </form>
  );
}
