#!/usr/bin/env node
/**
 * verify-auth-flow.js
 * ====================
 * Supabase 認証・課金・データ保護フローを実接続で検証する。
 * Next.task.md タスク5「ユーザー認証フロー完成」の動作確認を自動化。
 *
 * 検証項目:
 *   (1) サインアップ → profiles 自動生成トリガー (handle_new_user)
 *   (2) learning_records への insert/select (本人のみ)
 *   (3) RLS データ保護 — 他人の learning_records / purchases が見えない
 *   (4) purchases の本人参照 (service_role 書込 → 本人のみ select)
 *
 * 使い方:
 *   node scripts/verify-auth-flow.js            # フル検証 (テストユーザー作成→削除)
 *   node scripts/verify-auth-flow.js --keep     # 後始末せずテストユーザーを残す
 *
 * 必要な環境変数 (.env.local から自動読込):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const fs   = require('fs');
const path = require('path');

// ---- .env.local を自前でロード (dotenv 非依存) -------------------------
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local が見つかりません');
    process.exit(1);
  }
  const txt = fs.readFileSync(envPath, 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const { createClient } = require('@supabase/supabase-js');

const URL       = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEEP      = process.argv.includes('--keep');

if (!URL || !ANON || !SERVICE) {
  console.error('❌ Supabase の環境変数が不足しています');
  process.exit(1);
}

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- テスト結果集計 -----------------------------------------------------
let passed = 0, failed = 0;
function check(label, cond) {
  if (cond) { console.log(`  ✅ ${label}`); passed++; }
  else      { console.log(`  ❌ ${label}`); failed++; }
}

// ---- ユーティリティ -----------------------------------------------------
const STAMP = Date.now();
const PW    = 'Test-' + STAMP + '!aB';
const emailA = `verify-test-a-${STAMP}@example.com`;
const emailB = `verify-test-b-${STAMP}@example.com`;
const created = [];

async function createConfirmedUser(email) {
  // email_confirm:true でメール確認をスキップしてテストユーザーを作成
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PW, email_confirm: true,
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);
  created.push(data.user.id);
  return data.user;
}

async function userClient(email) {
  // anon キーでログインし、ユーザーセッションを持つクライアントを返す
  const c = createClient(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await c.auth.signInWithPassword({ email, password: PW });
  if (error) throw new Error(`signIn(${email}): ${error.message}`);
  return c;
}

async function cleanup() {
  if (KEEP) {
    console.log('\n🔖 --keep 指定: テストユーザーを残します');
    console.log('   ', created.join(', '));
    return;
  }
  console.log('\n🧹 後始末: テストユーザーを削除...');
  for (const id of created) {
    // cascade で profiles / learning_records / purchases も自動削除される
    const { error } = await admin.auth.admin.deleteUser(id);
    console.log(`   ${error ? '⚠️ ' + error.message : '✅ deleted ' + id}`);
  }
}

// ---- メイン検証 ---------------------------------------------------------
async function main() {
  console.log('🔐 Supabase 認証フロー検証');
  console.log(`   URL: ${URL}`);
  console.log('');

  // ── (1) サインアップ → profiles トリガー ──────────────────────────
  console.log('[1] サインアップ & profiles 自動生成トリガー');
  const userA = await createConfirmedUser(emailA);
  const userB = await createConfirmedUser(emailB);
  check('テストユーザー2人を作成', !!userA.id && !!userB.id);

  // トリガーが非同期で走る可能性に備え軽く待機
  await new Promise((r) => setTimeout(r, 800));
  const { data: profA } = await admin.from('profiles').select('id,email').eq('id', userA.id).single();
  check('handle_new_user トリガーで profiles 行が自動生成された', !!profA && profA.id === userA.id);
  check('profiles.email がサインアップ時のメールと一致', profA && profA.email === emailA);

  // ── (2) learning_records への insert/select (本人) ────────────────
  console.log('\n[2] learning_records 書き込み & 本人参照');
  const clientA = await userClient(emailA);
  const { error: insErr } = await clientA.from('learning_records').insert({
    user_id: userA.id, app_slug: 'tetris', score: 88, level: 5, duration: 120,
  });
  check('本人として learning_records に insert 成功 (RLS insert policy)', !insErr);

  const { data: ownRecs, error: selErr } = await clientA
    .from('learning_records').select('*').eq('app_slug', 'tetris');
  check('本人の learning_records を select 可能', !selErr && ownRecs && ownRecs.length === 1);
  check('保存した score が正しい', ownRecs && ownRecs[0] && ownRecs[0].score === 88);

  // ── (3) RLS データ保護: 他人のデータが見えない ───────────────────
  console.log('\n[3] RLS データ保護 (他人の learning_records が見えない)');
  const clientB = await userClient(emailB);
  const { data: bSeesA } = await clientB
    .from('learning_records').select('*').eq('user_id', userA.id);
  check('ユーザーB から ユーザーA の learning_records は 0 件 (RLS 保護)', Array.isArray(bSeesA) && bSeesA.length === 0);

  // ユーザーB が user_id を偽装して insert を試みる → RLS で拒否されるべき
  const { error: spoofErr } = await clientB.from('learning_records').insert({
    user_id: userA.id, app_slug: 'sudoku', score: 50,
  });
  check('user_id を偽装した insert は RLS で拒否される', !!spoofErr);

  // ── (4) purchases の RLS (service_role 書込 → 本人のみ参照) ───────
  console.log('\n[4] purchases RLS (service_role 書込 → 本人のみ参照)');
  const { error: buyErr } = await admin.from('purchases').insert({
    user_id: userA.id, app_slug: 'tetris',
    stripe_session_id: 'cs_test_' + STAMP, amount: 480,
  });
  check('service_role で purchases に書き込み成功', !buyErr);

  const { data: aBuys } = await clientA.from('purchases').select('*');
  check('ユーザーA は自分の購入記録を参照可能', Array.isArray(aBuys) && aBuys.length === 1);

  const { data: bBuys } = await clientB.from('purchases').select('*');
  check('ユーザーB から ユーザーA の購入記録は見えない (RLS 保護)', Array.isArray(bBuys) && bBuys.length === 0);

  // 冪等性: 同じ stripe_session_id で再 insert → unique 制約で弾かれる
  const { error: dupErr } = await admin.from('purchases').insert({
    user_id: userA.id, app_slug: 'tetris',
    stripe_session_id: 'cs_test_' + STAMP, amount: 480,
  });
  check('同一 stripe_session_id の重複 insert は unique 制約で拒否 (冪等性の基盤)', !!dupErr);
}

main()
  .then(cleanup)
  .then(() => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`結果: ${passed} 件成功 / ${failed} 件失敗`);
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch(async (err) => {
    console.error('\n❌ 検証中にエラー:', err.message);
    await cleanup().catch(() => {});
    process.exit(1);
  });
