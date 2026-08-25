-- T-097: rankings テーブル
create table if not exists public.rankings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  slug         text not null check (slug in ('tetris','sudoku','typing')),
  score        integer not null check (score >= 0),
  level        integer,
  duration_ms  integer,
  display_name text check (char_length(display_name) <= 20),
  played_at    timestamptz default now(),
  created_at   timestamptz default now()
);

alter table public.rankings enable row level security;

create policy "rankings_select_all" on public.rankings
  for select using (true);

create policy "rankings_insert_own" on public.rankings
  for insert with check (auth.uid() = user_id);

create index if not exists rankings_slug_score_idx
  on public.rankings (slug, score desc);

-- T-016: profiles にトライアルカラム追加
alter table public.profiles
  add column if not exists trial_ends_at    timestamptz,
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_used       boolean default false;
