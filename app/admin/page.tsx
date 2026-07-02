export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { APPS } from '@/lib/apps-config';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '管理画面 | Admin' };

const ADMIN_EMAIL = 'hiroshi.takizawa@digitalidentity.co.jp';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 管理者チェック
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-2">アクセス権限がありません</h1>
          <Link href="/" className="text-brand-400 hover:text-brand-300 text-sm">← トップに戻る</Link>
        </div>
      </main>
    );
  }

  // ── データ取得 ────────────────────────────────────────────────

  // 購入データ
  const { data: purchases } = await supabase
    .from('purchases')
    .select('app_slug, amount, created_at')
    .order('created_at', { ascending: false });

  // 学習記録数
  const { count: learningCount } = await supabase
    .from('learning_records')
    .select('id', { count: 'exact', head: true });

  // ユーザー数（admin API）
  const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const totalUsers = allUsers?.length ?? 0;
  const todayUsers = (allUsers ?? []).filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  // 集計
  const totalRevenue = (purchases ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalPurchases = purchases?.length ?? 0;

  // アプリ別売上
  const appRevMap: Record<string, { count: number; revenue: number }> = {};
  for (const p of purchases ?? []) {
    if (!appRevMap[p.app_slug]) appRevMap[p.app_slug] = { count: 0, revenue: 0 };
    appRevMap[p.app_slug].count++;
    appRevMap[p.app_slug].revenue += p.amount ?? 0;
  }
  const appStats = APPS
    .map(a => ({ ...a, ...( appRevMap[a.slug] ?? { count: 0, revenue: 0 }) }))
    .sort((a, b) => b.revenue - a.revenue);

  // 直近30日の日別売上
  const dailyMap: Record<string, number> = {};
  for (const p of purchases ?? []) {
    const day = new Date(p.created_at).toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + (p.amount ?? 0);
  }
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: key.slice(5), revenue: dailyMap[key] ?? 0 };
  });
  const maxDaily = Math.max(...last7Days.map(d => d.revenue), 1);

  // 今日・今月の売上
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const monthKey = now.toISOString().slice(0, 7);
  const todayRevenue = (purchases ?? [])
    .filter(p => p.created_at.startsWith(todayKey))
    .reduce((s, p) => s + (p.amount ?? 0), 0);
  const monthRevenue = (purchases ?? [])
    .filter(p => p.created_at.startsWith(monthKey))
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <main className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Hub</Link>
          <h1 className="text-2xl font-bold flex-1">🔐 管理画面</h1>
          <span className="text-xs text-gray-600">{user.email}</span>
        </div>

        {/* KPI サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '累計売上', value: `¥${totalRevenue.toLocaleString()}`, sub: `今月: ¥${monthRevenue.toLocaleString()}`, color: 'text-emerald-400' },
            { label: '今日の売上', value: `¥${todayRevenue.toLocaleString()}`, sub: `購入数: ${totalPurchases}件`, color: 'text-yellow-400' },
            { label: '総ユーザー数', value: `${totalUsers}人`, sub: `今日の新規: ${todayUsers}人`, color: 'text-blue-400' },
            { label: 'プレイ記録', value: `${(learningCount ?? 0).toLocaleString()}件`, sub: 'learning_records 累計', color: 'text-purple-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* 直近7日 売上グラフ（テキストベース） */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-wider">直近7日間の売上</h2>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map(({ day, revenue }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{revenue > 0 ? `¥${revenue}` : ''}</span>
                <div
                  className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all"
                  style={{ height: `${Math.max(4, (revenue / maxDaily) * 100)}%` }}
                />
                <span className="text-xs text-gray-600">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* アプリ別売上ランキング */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">アプリ別売上ランキング</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-white/5">
                <th className="text-left px-6 py-3">アプリ</th>
                <th className="text-right px-4 py-3">購入数</th>
                <th className="text-right px-4 py-3">定価</th>
                <th className="text-right px-6 py-3">累計売上</th>
              </tr>
            </thead>
            <tbody>
              {appStats.filter(a => a.count > 0 || true).slice(0, 15).map(app => (
                <tr key={app.slug} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-white">
                    <span className="mr-2">{app.emoji}</span>{app.title}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{app.count}件</td>
                  <td className="px-4 py-3 text-right text-gray-500">¥{app.price}</td>
                  <td className={`px-6 py-3 text-right font-bold ${app.revenue > 0 ? 'text-emerald-400' : 'text-gray-700'}`}>
                    ¥{app.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 最近の購入履歴 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">最近の購入（直近20件）</h2>
          </div>
          {(purchases?.length ?? 0) === 0 ? (
            <p className="px-6 py-8 text-center text-gray-600 text-sm">購入履歴なし</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-white/5">
                  <th className="text-left px-6 py-3">日時</th>
                  <th className="text-left px-4 py-3">アプリ</th>
                  <th className="text-right px-6 py-3">金額</th>
                </tr>
              </thead>
              <tbody>
                {(purchases ?? []).slice(0, 20).map((p, i) => {
                  const app = APPS.find(a => a.slug === p.app_slug);
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(p.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        {app?.emoji} {app?.title ?? p.app_slug}
                      </td>
                      <td className="px-6 py-3 text-right text-emerald-400 font-bold">
                        ¥{(p.amount ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  );
}
