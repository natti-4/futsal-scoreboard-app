-- Players, Matches, Match Scorers テーブル
-- 既存のテーブルと競合する場合は、Supabase SQL Editor で個別に実行してください

-- Players テーブル
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  number integer not null default 0,
  is_active boolean not null default true,
  total_goals integer not null default 0,
  created_at timestamptz default now()
);

-- Matches テーブル（self_score, opponent_score を使用）
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  self_score integer not null default 0,
  opponent_score integer not null default 0,
  opponent_name text not null default '',
  match_date timestamptz not null default now(),
  duration_seconds integer not null default 0,
  photo_url text,
  created_at timestamptz default now()
);

-- Match Scorers テーブル（得点者記録）
create table if not exists match_scorers (
  id uuid default gen_random_uuid() primary key,
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  goals integer not null default 1,
  created_at timestamptz default now(),
  unique(match_id, player_id)
);

-- RLS
alter table players enable row level security;
alter table matches enable row level security;
alter table match_scorers enable row level security;

create policy "Allow all players" on players for all using (true) with check (true);
create policy "Allow all matches" on matches for all using (true) with check (true);
create policy "Allow all match_scorers" on match_scorers for all using (true) with check (true);

-- ゴール数を加算する RPC
create or replace function increment_player_goals(
  player_id_param uuid,
  goals_to_add integer
) returns void as $$
begin
  update players
  set total_goals = total_goals + goals_to_add
  where id = player_id_param;
end;
$$ language plpgsql security definer;

-- ゴール数を減算する RPC（試合削除時用）
create or replace function decrement_player_goals(
  player_id_param uuid,
  goals_to_subtract integer
) returns void as $$
begin
  update players
  set total_goals = greatest(0, total_goals - goals_to_subtract)
  where id = player_id_param;
end;
$$ language plpgsql security definer;
