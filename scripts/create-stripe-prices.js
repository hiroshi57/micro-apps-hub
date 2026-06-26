/**
 * Stripe Product + Price 一括作成スクリプト
 *
 * 使い方:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/create-stripe-prices.js
 *
 * 実行後に出力される price_xxx を lib/apps-config.ts の stripePriceId に貼り付ける
 */

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

const APPS = [
  { id: 'tetris',              title: 'テトリス Pro',             price: 480 },
  { id: 'sudoku',              title: '数独 Pro',                 price: 480 },
  { id: 'shogi',               title: '将棋 Pro',                 price: 780 },
  { id: 'chess',               title: 'チェス Pro',               price: 780 },
  { id: 'othello',             title: 'オセロ Pro',               price: 480 },
  { id: 'minesweeper',         title: 'マインスイーパー Pro',     price: 380 },
  { id: '2048',                title: '2048 Pro',                 price: 380 },
  { id: 'snake',               title: 'スネーク Pro',             price: 380 },
  { id: 'breakout',            title: 'ブロック崩し Pro',         price: 480 },
  { id: 'memory-card',         title: '記憶カード Pro',           price: 380 },
  { id: 'slide-puzzle',        title: 'スライドパズル Pro',       price: 380 },
  { id: 'rock-paper-scissors', title: 'じゃんけんAI Pro',        price: 480 },
  { id: 'typing',              title: 'タイピング練習 Pro',       price: 580 },
  { id: 'reaction',            title: '反応速度テスト Pro',       price: 380 },
  { id: 'math-trainer',        title: '計算力トレーナー Pro',     price: 480 },
  { id: 'kanji-quiz',          title: '漢字クイズ Pro',           price: 680 },
  { id: 'pomodoro',            title: 'ポモドーロ Pro',           price: 580 },
  { id: 'breathing',           title: '呼吸瞑想 Pro',             price: 580 },
  { id: 'color-palette',       title: 'カラーパレット Pro',       price: 580 },
  { id: 'noise',               title: '作業用BGM Pro',            price: 680 },
  { id: 'quote',               title: '名言ジェネレーター Pro',   price: 380 },
];

async function main() {
  console.log('🚀 Stripe Product + Price を一括作成します...\n');
  const results = [];

  for (const app of APPS) {
    try {
      // Product 作成
      const product = await stripe.products.create({
        name: app.title,
        metadata: { app_slug: app.id },
      });

      // Price 作成（買い切り・JPY）
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: app.price,
        currency: 'jpy',
        metadata: { app_slug: app.id },
      });

      results.push({ id: app.id, priceId: price.id, price: app.price });
      console.log(`✅ ${app.title.padEnd(20)} → ${price.id}`);
    } catch (err) {
      console.error(`❌ ${app.title}: ${err.message}`);
    }
  }

  console.log('\n\n========================================');
  console.log('lib/apps-config.ts の stripePriceId に貼り付けてください:');
  console.log('========================================\n');

  results.forEach(r => {
    console.log(`  // ${r.id}  (¥${r.price})`);
    console.log(`  stripePriceId: '${r.priceId}',`);
    console.log('');
  });

  // JSON 出力も保存
  const fs = require('fs');
  fs.writeFileSync(
    'scripts/stripe-price-ids.json',
    JSON.stringify(results, null, 2),
  );
  console.log('💾 scripts/stripe-price-ids.json に保存しました');
}

main().catch(console.error);
