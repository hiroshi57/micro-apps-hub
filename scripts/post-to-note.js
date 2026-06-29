#!/usr/bin/env node
/**
 * post-to-note.js
 * Note.com に日替わりアプリ紹介記事を自動投稿する。
 *
 * 必要な環境変数:
 *   NOTE_EMAIL     - Note.com のメールアドレス
 *   NOTE_PASSWORD  - Note.com のパスワード
 *   NOTE_SESSION   - (任意) セッションクッキー文字列。設定時はログイン省略。
 *
 * 使い方:
 *   node scripts/post-to-note.js              # 今日の順番のアプリを投稿
 *   node scripts/post-to-note.js --dry-run    # 本文だけ表示して終了
 *   node scripts/post-to-note.js tetris       # 指定スラッグを投稿
 */

const https   = require('https');
const fs      = require('fs');
const path    = require('path');

// ---- アプリ一覧（循環インデックスで日替わり）---------------------------
const APPS = [
  { slug: 'tetris',             emoji: '🧱', title: 'テトリス',         desc: '定番ブロック落としゲーム。累積スキルを高めて最高スコアを目指せ。', price: 480 },
  { slug: 'sudoku',             emoji: '🔢', title: '数独',             desc: '頭を使う数字パズル。難易度地獄まで完全対応。',                   price: 480 },
  { slug: 'minesweeper',        emoji: '💣', title: 'マインスイーパー', desc: '地雷を避けて全マスを開放。タイムアタックで腕試し。',              price: 380 },
  { slug: '2048',               emoji: '🔀', title: '2048',             desc: 'スライドして数字を合わせる中毒パズル。',                         price: 380 },
  { slug: 'snake',              emoji: '🐍', title: 'スネーク',         desc: '成長するほど難しくなる古典ゲーム。',                              price: 380 },
  { slug: 'memory-card',        emoji: '🃏', title: '記憶カード',       desc: '短期記憶を鍛えるペア合わせゲーム。',                              price: 380 },
  { slug: 'breakout',           emoji: '🏓', title: 'ブロック崩し',     desc: 'ボールでブロックを消す爽快アクション。',                          price: 380 },
  { slug: 'slide-puzzle',       emoji: '🔲', title: 'スライドパズル',   desc: 'バラバラのピースを正しい順に並べ替え。',                          price: 380 },
  { slug: 'rock-paper-scissors', emoji: '✂️', title: 'じゃんけん AI',  desc: 'AIと戦略じゃんけん。読み合いで勝て。',                           price: 380 },
  { slug: 'typing',             emoji: '⌨️', title: 'タイピング練習',   desc: '日本語・英語のタイピングスキルを上げる。',                        price: 480 },
  { slug: 'pomodoro',           emoji: '🍅', title: 'ポモドーロ',       desc: '25分集中→5分休憩。生産性を科学的に高める。',                     price: 480 },
  { slug: 'breathing',          emoji: '🌬️', title: '呼吸瞑想',        desc: '4-7-8呼吸法でストレスを解放。',                                  price: 380 },
  { slug: 'reaction',           emoji: '⚡', title: '反応速度テスト',    desc: '自分の反応速度を計測。運動神経を数値化。',                        price: 380 },
  { slug: 'color-test',         emoji: '🎨', title: '色彩テスト',       desc: '微妙な色の違いを判別できるか試す。',                              price: 380 },
  { slug: 'math-trainer',       emoji: '🧮', title: '計算力トレーナー', desc: '暗算スピードを上げる脳トレ。',                                   price: 480 },
  { slug: 'kanji-quiz',         emoji: '🀄', title: '漢字クイズ',       desc: '読み・書きの確認から難漢字まで。',                               price: 480 },
  { slug: 'quote',              emoji: '💭', title: '名言ジェネレーター', desc: '偉人の言葉でモチベーションを上げる。',                          price: 380 },
  { slug: 'noise',              emoji: '🎧', title: '作業用 BGM',       desc: '雨音・カフェ・自然音で集中環境を作る。',                         price: 480 },
  { slug: 'color-palette',      emoji: '🎨', title: 'カラーパレット',   desc: 'デザイン用の色をすぐ生成。HEX/RGB対応。',                        price: 380 },
  { slug: 'schedule',           emoji: '📅', title: '時間割メーカー',   desc: '学校・習い事の時間割を簡単作成。',                               price: 380 },
  { slug: 'shogi',              emoji: '♟️', title: '将棋',             desc: '日本将棋。AI対局で棋力アップ。',                                 price: 580 },
  { slug: 'chess',              emoji: '♛',  title: 'チェス',           desc: '国際チェス。AIとの対局で戦略を磨く。',                           price: 580 },
  { slug: 'othello',            emoji: '⚫', title: 'オセロ',            desc: 'リバーシで頭を使う。AI難易度5段階。',                            price: 380 },
  { slug: 'senior-brain',       emoji: '🧠', title: 'シニア向け脳トレ', desc: '大きな文字・わかりやすい操作の脳活アプリ。',                     price: 480 },
];

const BASE_URL    = 'https://micro-apps-hub-seven.vercel.app';
const DRY_RUN     = process.argv.includes('--dry-run');
const targetSlug  = process.argv.find((a) => !a.startsWith('-') && a !== process.argv[0] && a !== process.argv[1]);

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

// ---- 記事本文を生成 -----------------------------------------------------
function buildBody(app) {
  const appUrl = `${BASE_URL}/apps/${app.slug}`;
  return [
    `# ${app.emoji} ${app.title}`,
    '',
    `> ${app.desc}`,
    '',
    `👉 **無料で遊ぶ**: [${appUrl}](${appUrl})`,
    '',
    '---',
    '',
    '## 無料でできること',
    '- 基本ゲームプレイ',
    '- スコア記録',
    '',
    '## Pro（買い切り）でできること',
    '- 全難易度・全機能解放',
    `- ¥${app.price.toLocaleString()} の買い切り（月額なし）`,
    '',
    '---',
    '',
    '#MicroAppsHub #ゲーム #無料アプリ #脳トレ #集中力',
  ].join('\n');
}

// ---- Note API 投稿（クッキーベース）------------------------------------
async function postToNote(app, body) {
  const sessionCookie = process.env.NOTE_SESSION;
  if (!sessionCookie) {
    console.warn('⚠️  NOTE_SESSION が未設定。投稿をスキップします。');
    console.warn('    Note.com の開発者ツールで __session クッキーを取得し環境変数に設定してください。');
    return;
  }

  const payload = JSON.stringify({
    note: {
      status: 'published',
      name: `${app.emoji} ${app.title} — 無料で遊べるミニアプリ紹介`,
      body,
      eyecatch_image_url: `${BASE_URL}/screenshots/${app.slug}.png`,
      hashtag_notes_attributes: [
        { tag_name: 'MicroAppsHub' },
        { tag_name: app.title },
        { tag_name: '無料アプリ' },
      ],
    },
  });

  const options = {
    hostname: 'note.com',
    path: '/api/v1/text_notes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
      'User-Agent': 'MicroAppsHub-Poster/1.0',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ Note 投稿成功: ${json.data?.key ? 'https://note.com/n/' + json.data.key : '(OK)'}`);
            resolve(json);
          } catch {
            console.log(`✅ Note 投稿成功 (HTTP ${res.statusCode})`);
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ---- main ---------------------------------------------------------------
async function main() {
  const app  = todaysApp();
  const body = buildBody(app);

  console.log(`📝 Note 投稿対象: ${app.emoji} ${app.title}`);
  console.log('--- 記事本文プレビュー ---');
  console.log(body.slice(0, 400) + (body.length > 400 ? '\n...(省略)' : ''));
  console.log('-------------------------');

  if (DRY_RUN) { console.log('🔍 [dry-run] 実際の投稿はスキップ'); return; }

  await postToNote(app, body);
}

main().catch((err) => { console.error('❌', err.message); process.exit(1); });
