-- ============================================================
-- MicroApps Hub — Supabase スキーマ
-- Supabase SQL Editor にそのまま貼り付けて実行してください
-- ============================================================

-- ユーザープロフィール（Supabase Auth と紐づけ）
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text,
  created_at  timestamptz default now()
);

-- 購入記録（Stripe Webhook が書き込む）
create table if not exists public.purchases (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users on delete cascade not null,
  app_slug          text not null,
  stripe_session_id text unique not null,
  amount            integer not null,       -- 円単位
  purchased_at      timestamptz default now()
);

-- インデックス（高速検索用）
create index if not exists purchases_user_id_idx    on public.purchases(user_id);
create index if not exists purchases_app_slug_idx   on public.purchases(app_slug);
create unique index if not exists purchases_user_app_idx on public.purchases(user_id, app_slug);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- profiles: 本人だけ参照可
alter table public.profiles enable row level security;
create policy "自分のプロフィールのみ参照" on public.profiles
  for select using (auth.uid() = id);

-- purchases: 本人の購入記録のみ参照可（書き込みは service_role のみ）
alter table public.purchases enable row level security;
create policy "自分の購入記録のみ参照" on public.purchases
  for select using (auth.uid() = user_id);

-- ============================================================
-- 学習記録（Pro版 — localStorage の代わりにサーバー保存）
-- ============================================================

create table if not exists public.learning_records (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  app_slug    text not null,
  score       integer not null check (score between 0 and 100),
  level       integer not null default 1,
  duration    integer not null default 0,  -- 秒
  correct     integer,
  total       integer,
  played_at   timestamptz default now()
);

create index if not exists learning_records_user_app_idx on public.learning_records(user_id, app_slug);
create index if not exists learning_records_played_at_idx on public.learning_records(played_at desc);

-- RLS: 本人のみ
alter table public.learning_records enable row level security;
create policy "自分の学習記録のみ参照" on public.learning_records
  for select using (auth.uid() = user_id);
create policy "自分の学習記録のみ挿入" on public.learning_records
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- Auth トリガー（ユーザー登録時に profiles を自動生成）
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
