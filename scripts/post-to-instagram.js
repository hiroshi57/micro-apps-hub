#!/usr/bin/env node
/**
 * post-to-instagram.js
 * Instagram Graph API で日替わりアプリ紹介を自動投稿する。
 *
 * 必要な環境変数 (Instagram Business Account + Facebook App 連携):
 *   INSTAGRAM_ACCESS_TOKEN  - ページアクセストークン (長期)
 *   INSTAGRAM_USER_ID       - IG ビジネスアカウントの User ID
 *
 * 画像は OGP ルート https://ドメイン/api/og/{slug} を使用する。
 *
 * 使い方:
 *   node scripts/post-to-instagram.js              # 今日の順番のアプリ
 *   node scripts/post-to-instagram.js --dry-run    # キャプションだけ表示
 *   node scripts/post-to-instagram.js tetris       # 指定スラッグ
 */

const https  = require('https');

// ---- アプリ一覧 ---------------------------------------------------------
const APPS = [
  { slug: 'tetris',             emoji: '🧱', title: 'テトリス',         price: 480 },
  { slug: 'sudoku',             emoji: '🔢', title: '数独',             price: 480 },
  { slug: 'minesweeper',        emoji: '💣', title: 'マインスイーパー', price: 380 },
  { slug: '2048',               emoji: '🔀', title: '2048',             price: 380 },
  { slug: 'snake',              emoji: '🐍', title: 'スネーク',         price: 380 },
  { slug: 'memory-card',        emoji: '🃏', title: '記憶カード',       price: 380 },
  { slug: 'breakout',           emoji: '🏓', title: 'ブロック崩し',     price: 380 },
  { slug: 'slide-puzzle',       emoji: '🔲', title: 'スライドパズル',   price: 380 },
  { slug: 'rock-paper-scissors', emoji: '✂️', title: 'じゃんけん AI',  price: 380 },
  { slug: 'typing',             emoji: '⌨️', title: 'タイピング練習',   price: 480 },
  { slug: 'pomodoro',           emoji: '🍅', title: 'ポモドーロ',       price: 480 },
  { slug: 'breathing',          emoji: '🌬️', title: '呼吸瞑想',        price: 380 },
  { slug: 'reaction',           emoji: '⚡', title: '反応速度テスト',    price: 380 },
  { slug: 'color-test',         emoji: '🎨', title: '色彩テスト',       price: 380 },
  { slug: 'math-trainer',       emoji: '🧮', title: '計算力トレーナー', price: 480 },
  { slug: 'kanji-quiz',         emoji: '🀄', title: '漢字クイズ',       price: 480 },
  { slug: 'quote',              emoji: '💭', title: '名言ジェネレーター', price: 380 },
  { slug: 'noise',              emoji: '🎧', title: '作業用 BGM',       price: 480 },
  { slug: 'color-palette',      emoji: '🎨', title: 'カラーパレット',   price: 380 },
  { slug: 'schedule',           emoji: '📅', title: '時間割メーカー',   price: 380 },
  { slug: 'shogi',              emoji: '♟️', title: '将棋',             price: 580 },
  { slug: 'chess',              emoji: '♛',  title: 'チェス',           price: 580 },
  { slug: 'othello',            emoji: '⚫', title: 'オセロ',            price: 380 },
  { slug: 'senior-brain',       emoji: '🧠', title: 'シニア向け脳トレ', price: 480 },
  { slug: 'flashcard',          emoji: '📖', title: '単語帳メーカー',   price: 480 },
  { slug: 'quiz-maker',         emoji: '❓', title: 'クイズ作成ツール', price: 580 },
  { slug: 'haiku',              emoji: '🌸', title: '俳句ジェネレーター', price: 380 },
  { slug: 'bingo',              emoji: '🎱', title: 'ビンゴカード',     price: 380 },
];

const BASE_URL   = 'https://micro-apps-hub-seven.vercel.app';
const GRAPH_URL  = 'graph.facebook.com';
const API_VER    = 'v20.0';
const DRY_RUN    = process.argv.includes('--dry-run');
const targetSlug = process.argv.find((a) => !a.startsWith('-') && a !== process.argv[0] && a !== process.argv[1]);

// ---- 今日のアプリを決定 -------------------------------------------------
function todaysApp() {
  if (targetSlug) {
    const found = APPS.find((a) => a.slug === targetSlug);
    if (!found) { console.error(`❌ アプリ不明: ${targetSlug}`); process.exit(1); }
    return found;
  }
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return APPS[dayOfYear % APPS.length];
}

// ---- キャプション生成 ---------------------------------------------------
function buildCaption(app) {
  const appUrl = `${BASE_URL}/apps/${app.slug}`;
  return [
    `${app.emoji} 今日のアプリ: ${app.title}`,
    '',
    '無料で遊べる！気に入ったら買い切りProにアップグレード 🚀',
    `💰 Pro: ¥${app.price.toLocaleString()} 買い切り（月額なし）`,
    '',
    `▶️ リンクはプロフィールから → micro-apps-hub-seven.vercel.app`,
    '',
    '#MicroAppsHub #無料ゲーム #脳トレ #集中力 #ミニアプリ',
    `#${app.title.replace(/\s/g, '')}`,
  ].join('\n');
}

// ---- Instagram Graph API helper ----------------------------------------
function graphRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const payload  = body ? JSON.stringify(body) : null;
    const options  = {
      hostname: GRAPH_URL,
      path: `/${API_VER}/${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(`Graph API: ${json.error.message}`));
          else resolve(json);
        } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ---- 2段階投稿 (container → publish) ------------------------------------
async function postToInstagram(app, caption) {
  const token  = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) {
    console.warn('⚠️  INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID が未設定。投稿をスキップします。');
    console.warn('    Instagram ビジネスアカウントと Facebook App の連携が必要です。');
    return;
  }

  const imageUrl = `${BASE_URL}/api/og/${app.slug}`;

  // Step 1: メディアコンテナ作成
  console.log('  📦 メディアコンテナを作成中...');
  const container = await graphRequest(
    `${userId}/media?access_token=${token}`,
    'POST',
    { image_url: imageUrl, caption }
  );
  const containerId = container.id;
  if (!containerId) throw new Error('コンテナ ID が取得できません');

  // コンテナ準備完了を待機 (最大30秒)
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await graphRequest(
      `${containerId}?fields=status_code&access_token=${token}`,
      'GET'
    );
    if (status.status_code === 'FINISHED') break;
    if (status.status_code === 'ERROR') throw new Error('コンテナエラー');
    console.log(`  ⏳ コンテナ準備中... (${status.status_code})`);
  }

  // Step 2: 公開
  console.log('  📤 投稿を公開中...');
  const result = await graphRequest(
    `${userId}/media_publish?access_token=${token}`,
    'POST',
    { creation_id: containerId }
  );

  console.log(`✅ Instagram 投稿成功: ID ${result.id}`);
}

// ---- main ---------------------------------------------------------------
async function main() {
  const app     = todaysApp();
  const caption = buildCaption(app);

  console.log(`📸 Instagram 投稿対象: ${app.emoji} ${app.title}`);
  console.log('--- キャプションプレビュー ---');
  console.log(caption);
  console.log('----------------------------');

  if (DRY_RUN) { console.log('🔍 [dry-run] 実際の投稿はスキップ'); return; }

  await postToInstagram(app, caption);
}

main().catch((err) => { console.error('❌', err.message); process.exit(1); });
