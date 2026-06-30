/**
 * /api/learning
 *
 * Pro ユーザーの学習記録を Supabase `learning_records` に保存・取得する。
 *
 * - 認証は Supabase の cookie セッション経由（server client）。
 * - RLS ポリシー（auth.uid() = user_id）でユーザー自身の行のみ読み書き可能。
 * - 未ログインの場合は 401 を返す（無料版は localStorage のみ）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface LearningPayload {
  slug: string;
  score: number;
  level?: number;
  duration?: number;
  correct?: number;
  total?: number;
  playedAt?: string;
}

function isValidPayload(body: unknown): body is LearningPayload {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b['slug'] === 'string' &&
    b['slug'].length > 0 &&
    typeof b['score'] === 'number' &&
    b['score'] >= 0 &&
    b['score'] <= 100
  );
}

// ── 学習記録を保存 ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const record = {
    user_id: user.id,
    app_slug: body.slug,
    score: Math.round(body.score),
    level: body.level ?? 1,
    duration: body.duration ?? 0,
    correct: body.correct ?? null,
    total: body.total ?? null,
    played_at: body.playedAt ?? new Date().toISOString(),
  };

  const { error } = await supabase.from('learning_records').insert(record);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// ── 学習記録を取得（任意で ?slug= で絞り込み）────────────────────
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get('slug');

  let query = supabase
    .from('learning_records')
    .select('app_slug, score, level, duration, correct, total, played_at')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(500);

  if (slug) {
    query = query.eq('app_slug', slug);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data ?? [] });
}
