const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'app', 'apps');

const apps = [
  { slug: 'sudoku', title: '数独', emoji: '🔢', price: 480, desc: '難・超難・地獄レベルでプロ級の思考力を鍛える完全版', features: ['難・超難・地獄 難易度', 'ヒント無制限', 'タイム記録・ランキング', 'ペンシルメモ機能'], color: 'from-green-600 to-emerald-500' },
  { slug: 'minesweeper', title: 'マインスイーパー', emoji: '💣', price: 380, desc: '中級〜上級・カスタムマップで本格マインスイーパー', features: ['中級(16×16)・上級(30×16)・カスタム', 'タイムランキング', '統計グラフ', 'テーマ変更'], color: 'from-red-600 to-orange-500' },
  { slug: '2048', title: '2048', emoji: '🔀', price: 380, desc: '5×5・6×6グリッドでさらなる高みへ', features: ['5×5・6×6 グリッド', '無制限アンドゥ', 'カラーテーマ', 'AI自動プレイ観戦'], color: 'from-yellow-600 to-amber-500' },
  { slug: 'snake', title: 'スネーク', emoji: '🐍', price: 380, desc: '障害物・迷路モードで究極のスネークを体験', features: ['障害物モード・迷路モード', 'オンラインランキング', '5速度設定', 'カスタムスキン'], color: 'from-lime-600 to-green-500' },
  { slug: 'breakout', title: 'ブロック崩し', emoji: '🏓', price: 480, desc: '50ステージ・パワーアップ搭載の完全版ブロック崩し', features: ['50ステージ', 'パワーアップアイテム 8種', 'BGM 5種類', 'カスタムボール・パドル'], color: 'from-purple-600 to-violet-500' },
  { slug: 'memory-card', title: '記憶カード', emoji: '🃏', price: 380, desc: '最大40枚・カスタム画像で記憶力の限界に挑む', features: ['最大20ペア(40枚)', '10種テーマ', 'カスタム画像アップロード', '2人対戦モード'], color: 'from-pink-600 to-rose-500' },
  { slug: 'slide-puzzle', title: 'スライドパズル', emoji: '🔲', price: 380, desc: '5×5・6×6グリッドとオリジナル画像で究極のパズル', features: ['5×5・6×6 グリッド', 'オリジナル画像パズル', 'タイムランキング', 'ヒント機能'], color: 'from-teal-600 to-cyan-500' },
  { slug: 'rock-paper-scissors', title: 'じゃんけんAI', emoji: '✂️', price: 480, desc: 'あなたのクセを読む学習型AIとの究極じゃんけん', features: ['学習型AI（クセ読み）', 'vs 友達モード', '統計グラフ', '称号システム'], color: 'from-indigo-600 to-blue-500' },
  { slug: 'typing', title: 'タイピング練習', emoji: '⌨️', price: 580, desc: '英語・プログラミング・漢字まで網羅した本格タイピング', features: ['英語・プログラミング・漢字', '単語1000語+', '成長グラフ', 'オリジナル文章登録'], color: 'from-slate-600 to-gray-500' },
  { slug: 'reaction', title: '反応速度テスト', emoji: '⚡', price: 380, desc: '10種類の反応テストで総合的な反射神経を計測', features: ['10種類のテスト', '30日間グラフ', '詳細統計', 'フレンドランキング'], color: 'from-yellow-500 to-orange-400' },
  { slug: 'math-trainer', title: '計算力トレーナー', emoji: '🧮', price: 480, desc: '掛け算・分数・上級まで無制限で計算力を極める', features: ['掛け算・割り算・分数', '上級・超級 難易度', '無制限プレイ', '成長グラフ'], color: 'from-emerald-600 to-teal-500' },
  { slug: 'kanji-quiz', title: '漢字クイズ', emoji: '🀄', price: 680, desc: 'N1〜N5全レベル・書き取りまで完全対応', features: ['N1〜N5 全レベル', '書き取り・熟語クイズ', '苦手問題自動出題', '学習記録'], color: 'from-red-700 to-rose-600' },
  { slug: 'pomodoro', title: 'ポモドーロ', emoji: '🍅', price: 580, desc: 'カスタム時間・BGM・タスクリスト連携の本格集中タイマー', features: ['カスタム時間設定', '統計・週次グラフ', 'BGM 10種類', 'タスクリスト連携'], color: 'from-red-600 to-pink-500' },
  { slug: 'breathing', title: '呼吸瞑想', emoji: '🌬️', price: 580, desc: '8種類の呼吸法と環境音で深いリラクゼーションを実現', features: ['8種類の呼吸法', '最大30分セッション', '環境音 8種', '継続日数・記録'], color: 'from-sky-500 to-blue-400' },
  { slug: 'color-palette', title: 'カラーパレット', emoji: '🎨', price: 580, desc: '8色グラデーション・CSS/SCSS出力・Figma連携対応', features: ['8色・グラデーション生成', 'コレクション保存', 'CSS/SCSS エクスポート', 'Figma 連携'], color: 'from-orange-600 to-yellow-500' },
  { slug: 'noise', title: '作業用BGM', emoji: '🎧', price: 680, desc: '15種類の環境音を自由ミックスして最高の作業環境を作る', features: ['15種類の環境音', '複数音源の自由ミックス', '無制限再生', 'ポモドーロタイマー連携'], color: 'from-blue-700 to-indigo-600' },
  { slug: 'quote', title: '名言ジェネレーター', emoji: '💭', price: 380, desc: '無制限生成・お気に入り保存・壁紙ダウンロード対応', features: ['無制限生成', '日英・カテゴリ別選択', 'お気に入り保存', '壁紙ダウンロード(PNG)'], color: 'from-violet-600 to-purple-500' },
  { slug: 'shogi', title: '将棋', emoji: '♟️', price: 780, desc: '中級〜最強AI・棋譜記録・オンライン対戦搭載の本格将棋', features: ['中級・上級・最強 AI', '棋譜記録・再生機能', 'ヒント機能（次の一手）', 'オンライン対戦'], color: 'from-amber-800 to-yellow-700' },
  { slug: 'chess', title: 'チェス', emoji: '♛', price: 780, desc: '棋譜PGN出力・Opening Book解説付きの本格チェス', features: ['中級・上級・最強 AI', '棋譜 PGN 出力', 'Opening Book 解説', 'オンライン対戦'], color: 'from-stone-700 to-gray-600' },
  { slug: 'othello', title: 'オセロ', emoji: '⚫', price: 480, desc: '詰めオセロ100問・最強AIで本格リバーシを楽しむ', features: ['中級・上級・最強 AI', '詰めオセロ問題集 100問', 'タイムランキング', 'ダークテーマ変更'], color: 'from-gray-700 to-gray-600' },
  { slug: 'color-test', title: '色彩テスト', emoji: '🎨', price: 480, desc: '10種類のカラーテストで色覚特性を詳細分析', features: ['10種類のカラーテスト', '色覚特性レポート', '詳細解析グラフ', 'PDF ダウンロード'], color: 'from-fuchsia-600 to-pink-500' },
  { slug: 'schedule', title: '時間割メーカー', emoji: '📅', price: 580, desc: '無制限カラー・PDF出力・Google Calendar同期対応', features: ['カスタムテンプレート', '無制限カラー・フォント', 'PDF 書き出し', 'Google Calendar 同期'], color: 'from-cyan-600 to-sky-500' },
];

function toPascal(slug) {
  return slug.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function genProPage(app) {
  const featureItems = app.features
    .map(f => `            <li className="flex items-center gap-2"><span className="text-pro-400">\\u2605</span> ${f}</li>`)
    .join('\n');

  const proItems = app.features
    .map(f => `          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">\\u2605</span> ${f}</div>`)
    .join('\n');

  return [
    "export const dynamic = 'force-dynamic';",
    "",
    "import Link from 'next/link';",
    "import { createClient } from '@/lib/supabase/server';",
    "import { hasPurchased } from '@/lib/purchases';",
    "",
    `export default async function ${toPascal(app.slug)}ProPage({`,
    "  searchParams,",
    "}: {",
    "  searchParams: Promise<{ success?: string }>;",
    "}) {",
    "  const supabase = await createClient();",
    "  const { data: { user } } = await supabase.auth.getUser();",
    "  const params = await searchParams;",
    "",
    `  const purchased = user ? await hasPurchased(user.id, '${app.slug}') : false;`,
    "  const justPurchased = params.success === '1';",
    "",
    "  if (!user) {",
    "    return (",
    '      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">',
    '        <div className="text-center max-w-md p-8">',
    '          <div className="text-6xl mb-4">🔒</div>',
    '          <h1 className="text-3xl font-bold mb-3">ログインが必要です</h1>',
    '          <p className="text-gray-400 mb-6">Pro版を購入・利用するにはアカウントが必要です。</p>',
    '          <Link href="/auth/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-full transition-colors">',
    '            ログイン / 新規登録',
    '          </Link>',
    '        </div>',
    '      </main>',
    "    );",
    "  }",
    "",
    "  if (!purchased) {",
    "    return (",
    '      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">',
    '        <div className="text-center max-w-md p-8">',
    `          <div className="text-6xl mb-4">${app.emoji}</div>`,
    `          <h1 className="text-3xl font-bold mb-2">${app.title} Pro</h1>`,
    `          <p className="text-gray-400 mb-6">${app.desc}</p>`,
    '          <ul className="text-left text-sm text-gray-300 mb-8 space-y-2">',
    featureItems,
    '            <li className="flex items-center gap-2"><span className="text-pro-400">&#9733;</span> 永久利用・買い切り</li>',
    '          </ul>',
    '          <form action="/api/stripe/checkout" method="POST">',
    `            <input type="hidden" name="appSlug" value="${app.slug}" />`,
    '            <button',
    '              type="submit"',
    `              className="w-full bg-gradient-to-r ${app.color} hover:opacity-90 text-white font-bold py-4 px-8 rounded-full text-lg transition-all"`,
    '            >',
    `              ¥${app.price.toLocaleString()} で Pro を購入（買い切り）`,
    '            </button>',
    '          </form>',
    `          <Link href="/apps/${app.slug}" className="block mt-3 text-gray-500 text-sm hover:text-white transition-colors">`,
    '            無料版に戻る',
    '          </Link>',
    '        </div>',
    '      </main>',
    "    );",
    "  }",
    "",
    "  return (",
    '    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4">',
    "      {justPurchased && (",
    '        <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm">',
    '          🎉 購入ありがとうございます！全機能が解放されました。',
    '        </div>',
    "      )}",
    '      <div className="mb-6 flex items-center gap-3">',
    '        <Link href="/" className="text-gray-500 hover:text-white">← Hub</Link>',
    '        <span className="text-gray-700">/</span>',
    `        <h1 className="text-2xl font-bold">${app.emoji} ${app.title} Pro</h1>`,
    `        <span className="bg-gradient-to-r ${app.color} text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>`,
    '      </div>',
    '      <div className="text-center max-w-sm">',
    '        <div className="text-8xl mb-6">',
    `          ${app.emoji}`,
    '        </div>',
    `        <p className="text-gray-400 mb-8">${app.desc}</p>`,
    '        <div className="grid gap-3">',
    proItems,
    '          <div className="bg-white/5 rounded-xl px-4 py-3 text-left text-sm text-gray-300 flex items-center gap-2"><span className="text-pro-400">&#9733;</span> 永久利用・買い切り</div>',
    '        </div>',
    '      </div>',
    '    </main>',
    "  );",
    "}",
    "",
  ].join('\n');
}

let count = 0;
for (const app of apps) {
  const dir = path.join(BASE, app.slug, 'pro');
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, genProPage(app));
    console.log('WROTE', app.slug);
    count++;
  } else {
    console.log('SKIP (exists)', app.slug);
  }
}
console.log('Done! Wrote:', count, 'new files');
