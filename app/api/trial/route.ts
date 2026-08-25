/**
 * /api/trial — T-016 無料トライアル期間管理 API
 *
 * 新規ユーザーに7日間の Pro 機能トライアルを付与する。
 *
 * profiles テーブルに trial_ends_at カラムが必要:
 * ──────────────────────────────────────────
 * -- profiles テーブルにカラムを追加（既存テーブルへのマイグレーション）
 * alter table public.profiles
 *   add column if not exists trial_ends_at timestamptz,
 *   add column if not exists trial_started_at timestamptz,
 *   add column if not exists trial_used boolean default false;
 * ──────────────────────────────────────────
 *
 * エンドポイント:
 *   GET  /api/trial           トライアル状態を取得（認証必須）
 *   POST /api/trial           トライアルを開始（未使用ユーザーのみ）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TRIAL_DAYS = 7;

// ── GET — トライアル状態確認 ──────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_pro, trial_ends_at, trial_started_at, trial_used')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'プロファイルが見つかりません' }, { status: 404 });
  }

  const now = new Date();
  const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const trialActive = trialEnds != null && trialEnds > now;
  const trialExpired = profile.trial_used && trialEnds != null && trialEnds <= now;
  const remainingMs = trialActive && trialEnds ? trialEnds.getTime() - now.getTime() : 0;
  const remainingDays = Math.ceil(remainingMs / 86_400_000);

  return NextResponse.json({
    is_pro:        profile.is_pro ?? false,
    trial_used:    profile.trial_used ?? false,
    trial_active:  trialActive,
    trial_expired: trialExpired,
    trial_ends_at: profile.trial_ends_at ?? null,
    remaining_days: trialActive ? remainingDays : 0,
    // 無料トライアルを開始できるか
    can_start_trial: !(profile.is_pro || profile.trial_used),
  });
}

// ── POST — トライアル開始 ──────────────────────────────────────
export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  // 現在のプロファイルを確認
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('is_pro, trial_used')
    .eq('id', user.id)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'プロファイルが見つかりません' }, { status: 404 });
  }

  if (profile.is_pro) {
    return NextResponse.json({ error: 'すでに Pro プランです' }, { status: 409 });
  }

  if (profile.trial_used) {
    return NextResponse.json(
      { error: 'トライアルはすでに使用済みです（1アカウント1回限り）' },
      { status: 409 },
    );
  }

  // トライアル開始
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      trial_started_at: now.toISOString(),
      trial_ends_at:    trialEndsAt.toISOString(),
      trial_used:       true,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('[trial POST]', updateError);
    return NextResponse.json({ error: 'トライアル開始に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    trial_ends_at:  trialEndsAt.toISOString(),
    remaining_days: TRIAL_DAYS,
    message: `${TRIAL_DAYS}日間の無料トライアルを開始しました！`,
  }, { status: 201 });
}
