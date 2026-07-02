export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserPurchases } from '@/lib/purchases';
import { APPS } from '@/lib/apps-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マイページ',
  description: '購入済みアプリ・学習記録を確認できます',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 未ログイン → ログインへ
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-sm p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-3">ログインが必要です</h1>
          <p className="text-gray-400 mb-6 text-sm">マイページを見るにはアカウントが必要です。</p>
          <Link
            href="/auth/login"
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3 rounded-full transition-colors text-sm"
          >
            ログイン / 新規登録
          </Link>
        </div>
      </main>
    );
  }

  // 購入済みアプリ取得
  const purchasedSlugs = await getUserPurchases(user.id);
  const purchasedApps = APPS.filter(a => purchasedSlugs.includes(a.slug));

  // 学習記録取得（直近30件）
  const { data: records } = await supabase
    .from('learning_records')
    .select('app_slug, score, level, played_at')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(30);

  // アプリ別プレイ回数
  const playCountMap: Record<string, number> = {};
  const bestScoreMap: Record<string, number> = {};
  for (const r of records ?? []) {
    playCountMap[r.app_slug] = (playCountMap[r.app_slug] ?? 0) + 1;
    if ((bestScoreMap[r.app_slug] ?? 0) < r.score) bestScoreMap[r.app_slug] = r.score;
  }

  const activeApps = APPS.filter(a => playCountMap[a.slug]);

  return (
    <main className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">← Hub</Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">マイページ</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: '購入済みアプリ', value: purchasedApps.length, unit: '本', icon: '⭐' },
            { label: '総プレイ回数', value: records?.length ?? 0, unit: '回', icon: '🎮' },
            { label: 'プレイしたアプリ', value: activeApps.length, unit: '本', icon: '📊' },
          ].map(({ label, value, unit, icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-white">{value}<span className="text-sm text-gray-400 ml-1">{unit}</span></div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* 購入済みアプリ */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>⭐ 購入済みアプリ</span>
            <span className="text-sm font-normal text-gray-500">（{purchasedApps.length}本）</span>
          </h2>
          {purchasedApps.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-sm">
              まだ購入済みアプリはありません。<br />
              <Link href="/" className="text-brand-400 hover:text-brand-300 mt-2 inline-block">アプリを見る →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {purchasedApps.map(app => (
                <Link
                  key={app.slug}
                  href={`/apps/${app.slug}/pro`}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pro-500/40 rounded-2xl p-4 transition-all group"
                >
                  <div className="text-3xl mb-2">{app.emoji}</div>
                  <div className="font-bold text-sm text-white group-hover:text-pro-300 transition-colors">{app.title}</div>
                  <div className="text-xs text-pro-400 mt-1">Pro 解放済み ✓</div>
                  {bestScoreMap[app.slug] !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">ベスト: {bestScoreMap[app.slug]}点</div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 最近のプレイ記録 */}
        {(records?.length ?? 0) > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">📈 最近のプレイ記録</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-xs">
                    <th className="text-left px-4 py-3">アプリ</th>
                    <th className="text-right px-4 py-3">スコア</th>
                    <th className="text-right px-4 py-3">Lv</th>
                    <th className="text-right px-4 py-3">日時</th>
                  </tr>
                </thead>
                <tbody>
                  {(records ?? []).slice(0, 10).map((r, i) => {
                    const app = APPS.find(a => a.slug === r.app_slug);
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">
                          <span className="mr-2">{app?.emoji ?? '🎮'}</span>
                          {app?.title ?? r.app_slug}
                        </td>
                        <td className="px-4 py-3 text-right text-pro-400 font-bold">{r.score}点</td>
                        <td className="px-4 py-3 text-right text-gray-400">Lv.{r.level}</td>
                        <td className="px-4 py-3 text-right text-gray-600 text-xs">
                          {new Date(r.played_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* まだプレイしていない場合 */}
        {(records?.length ?? 0) === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-sm mb-10">
            まだプレイ記録がありません。<br />
            <Link href="/" className="text-brand-400 hover:text-brand-300 mt-2 inline-block">アプリで遊んでみる →</Link>
          </div>
        )}

        {/* アカウント操作 */}
        <section className="border-t border-white/10 pt-8">
          <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">アカウント</h2>
          <div className="space-y-2">
            <Link href="/help" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors py-2">
              <span>❓</span> よくある質問
            </Link>
            <a href="mailto:hiroshi.takizawa@digitalidentity.co.jp" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors py-2">
              <span>✉️</span> サポートに問い合わせる
            </a>
            <Link href="/legal/tokusho" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors py-2">
              <span>📄</span> 特定商取引法に基づく表記
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
