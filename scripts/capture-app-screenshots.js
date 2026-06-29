#!/usr/bin/env node
/**
 * capture-app-screenshots.js
 * Playwright で各アプリページのスクリーンショットを自動撮影する。
 *
 * 前提: npx playwright install chromium
 *
 * 使い方:
 *   node scripts/capture-app-screenshots.js            # 全アプリ
 *   node scripts/capture-app-screenshots.js tetris     # 1本だけ
 *
 * 出力: public/screenshots/{slug}.png  (1200×630)
 */

const path  = require('path');
const fs    = require('fs');

// Playwright は devDependency (npx playwright install chromium が必要)
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  if (!process.argv.includes('--dry-run')) {
    console.error('❌ playwright が見つかりません。次を実行してインストールしてください:');
    console.error('   npm install --save-dev playwright');
    console.error('   npx playwright install chromium');
    process.exit(1);
  }
}

// ---- アプリ一覧（apps-config と同期） -----------------------------------
const APPS = [
  { slug: 'tetris',             emoji: '🧱', title: 'テトリス' },
  { slug: 'sudoku',             emoji: '🔢', title: '数独' },
  { slug: 'minesweeper',        emoji: '💣', title: 'マインスイーパー' },
  { slug: '2048',               emoji: '🔀', title: '2048' },
  { slug: 'snake',              emoji: '🐍', title: 'スネーク' },
  { slug: 'memory-card',        emoji: '🃏', title: '記憶カード' },
  { slug: 'breakout',           emoji: '🏓', title: 'ブロック崩し' },
  { slug: 'slide-puzzle',       emoji: '🔲', title: 'スライドパズル' },
  { slug: 'rock-paper-scissors',emoji: '✂️', title: 'じゃんけん AI' },
  { slug: 'typing',             emoji: '⌨️', title: 'タイピング練習' },
  { slug: 'pomodoro',           emoji: '🍅', title: 'ポモドーロ' },
  { slug: 'breathing',          emoji: '🌬️', title: '呼吸瞑想' },
  { slug: 'reaction',           emoji: '⚡', title: '反応速度テスト' },
  { slug: 'color-test',         emoji: '🎨', title: '色彩テスト' },
  { slug: 'math-trainer',       emoji: '🧮', title: '計算力トレーナー' },
  { slug: 'kanji-quiz',         emoji: '🀄', title: '漢字クイズ' },
  { slug: 'quote',              emoji: '💭', title: '名言ジェネレーター' },
  { slug: 'noise',              emoji: '🎧', title: '作業用 BGM' },
  { slug: 'color-palette',      emoji: '🎨', title: 'カラーパレット' },
  { slug: 'schedule',           emoji: '📅', title: '時間割メーカー' },
  { slug: 'shogi',              emoji: '♟️', title: '将棋' },
  { slug: 'chess',              emoji: '♛',  title: 'チェス' },
  { slug: 'othello',            emoji: '⚫', title: 'オセロ' },
  { slug: 'senior-brain',       emoji: '🧠', title: 'シニア向け脳トレ' },
];

// ---- 設定 ---------------------------------------------------------------
const BASE_URL   = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000';
const OUT_DIR    = path.join(__dirname, '..', 'public', 'screenshots');
const WIDTH      = 1200;
const HEIGHT     = 630;
const DRY_RUN    = process.argv.includes('--dry-run');
const targetSlug = process.argv.find((a) => !a.startsWith('-') && a !== process.argv[0] && a !== process.argv[1]);

async function main() {
  const apps = targetSlug ? APPS.filter((a) => a.slug === targetSlug) : APPS;

  if (apps.length === 0) {
    console.error(`❌ アプリが見つかりません: ${targetSlug}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  if (DRY_RUN) {
    console.log('🔍 [dry-run] 撮影対象:');
    apps.forEach((a) => console.log(`  ${a.emoji} /apps/${a.slug}  →  ${a.slug}.png`));
    return;
  }

  console.log(`📸 ${apps.length}本のアプリをスクリーンショット撮影 (${BASE_URL})`);

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });

  let ok = 0, ng = 0;
  for (const app of apps) {
    const url  = `${BASE_URL}/apps/${app.slug}`;
    const dest = path.join(OUT_DIR, `${app.slug}.png`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: dest, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      console.log(`  ✅ ${app.emoji} ${app.slug}.png`);
      ok++;
    } catch (err) {
      console.warn(`  ⚠️  ${app.emoji} ${app.slug} — ${err.message.split('\n')[0]}`);
      ng++;
    }
  }

  await browser.close();
  console.log(`\n完了: ${ok}成功 / ${ng}失敗 → ${OUT_DIR}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
