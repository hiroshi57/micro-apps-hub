/**
 * /api/rankings — T-097 オンラインランキング API
 *
 * テトリス・数独・タイピングのスコアを Supabase `rankings` テーブルに保存・取得。
 *
 * テーブル定義 (Supabase SQL Editor で実行):
 * ──────────────────────────────────────────
 * create table public.rankings (
 *   id          uuid primary key default gen_random_uuid(),
 *   user_id     uuid references auth.users(id) on delete cascade,
 *   slug        text not null,           -- 'tetris' | 'sudoku' | 'typing'
 *   score       integer not null,
 *   level       integer,
 *   duration_ms integer,
 *   display_name text,                   -- ランキング表示名（任意）
 *   played_at   timestamptz default now(),
 *   created_at  timestamptz default now()
 * );
 *
 * -- RLS: 全員が読める、書くのは本人のみ
 * alter table public.rankings enable row level security;
 *
 * create policy "rankings_select_all" on public.rankings
 *   for select using (true);
 *
 * create policy "rankings_insert_own" on public.rankings
 *   for insert with check (auth.uid() = user_id);
 *
 * -- スコア降順インデックス
 * create index rankings_slug_score_idx on public.rankings (slug, score desc);
 * ──────────────────────────────────────────
 *
 * エンドポイント:
 *   GET  /api/rankings?slug=tetris&limit=20   ランキング一覧（認証不要）
 *   POST /api/rankings                         スコア登録（Pro ユーザーのみ）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_SLUGS = ['tetris', 'sudoku', 'typing'] as const;
type Slug = (typeof ALLOWED_SLUGS)[number];

function isSlug(v: unknown): v is Slug {
  return typeof v === 'string' && (ALLOWED_SLUGS as readonly string[]).includes(v);
}

// ── GET — ランキング一覧（認証不要・上位N件） ──────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get('slug');
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);

  if (!isSlug(slug)) {
    return NextResponse.json(
      { error: `slug は ${ALLOWED_SLUGS.join(' | ')} のいずれかを指定してください` },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rankings')
    .select('id, display_name, score, level, duration_ms, played_at')
    .eq('slug', slug)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[rankings GET]', error);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({
    slug,
    rankings: (data ?? []).map((row, i) => ({ rank: i + 1, ...row })),
    total: data?.length ?? 0,
  });
}

// ── POST — スコア登録（Pro ユーザーのみ） ─────────────────────
interface RankingPayload {
  slug: string;
  score: number;
  level?: number;
  duration_ms?: number;
  display_name?: string;
}

function isValidPayload(body: unknown): body is RankingPayload {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    isSlug(b['slug']) &&
    typeof b['score'] === 'number' &&
    b['score'] >= 0 &&
    b['score'] <= 9_999_999
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  // Pro ユーザー確認（profiles テーブルの is_pro フラグ）
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro, trial_ends_at')
    .eq('id', user.id)
    .single();

  const now = new Date();
  const trialActive =
    profile?.trial_ends_at && new Date(profile.trial_ends_at) > now;
  const hasAccess = profile?.is_pro || trialActive;

  if (!hasAccess) {
    return NextResponse.json(
      { error: 'オンラインランキングは Pro プラン専用です' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON が不正です' }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: 'slug・score が必須です（score: 0〜9,999,999）' },
      { status: 422 },
    );
  }

  const { error, data } = await supabase
    .from('rankings')
    .insert({
      user_id:      user.id,
      slug:         body.slug,
      score:        body.score,
      level:        body.level ?? null,
      duration_ms:  body.duration_ms ?? null,
      display_name: (body.display_name ?? '').slice(0, 20) || null,
    })
    .select('id, score, slug, played_at')
    .single();

  if (error) {
    console.error('[rankings POST]', error);
    return NextResponse.json({ error: 'スコア登録に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, entry: data }, { status: 201 });
}
