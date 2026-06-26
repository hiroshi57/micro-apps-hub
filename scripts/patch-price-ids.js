/**
 * stripe-price-ids.json の内容を lib/apps-config.ts に自動パッチするスクリプト
 */
const fs = require('fs');
const path = require('path');

const priceIds = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'stripe-price-ids.json'), 'utf8')
);

let config = fs.readFileSync(
  path.join(__dirname, '..', 'lib', 'apps-config.ts'),
  'utf8'
);

let patched = 0;
for (const { id, priceId } of priceIds) {
  // stripePriceId: 'price_xxx' の形式を置換
  // slug が id と一致するブロックを探して置換
  const regex = new RegExp(
    `(id:\\s*['"]${id.replace(/[-]/g, '\\-')}['"][^}]*?stripePriceId:\\s*')[^'"]+'`,
    's'
  );
  const prev = config;
  config = config.replace(regex, `$1${priceId}'`);
  if (config !== prev) {
    console.log(`✅ ${id.padEnd(24)} → ${priceId}`);
    patched++;
  } else {
    console.log(`⚠️  ${id.padEnd(24)} (パターン不一致 — 手動確認)`);
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'lib', 'apps-config.ts'),
  config
);
console.log(`\n完了: ${patched}/${priceIds.length} 件パッチ済み`);
