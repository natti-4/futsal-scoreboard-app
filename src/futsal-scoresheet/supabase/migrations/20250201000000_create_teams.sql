-- Team Profile Settings
-- Run this migration in your Supabase SQL Editor if not using local migrations

create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null default 'マイチーム',
  color text not null default '#3b82f6',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table teams enable row level security;

-- Allow read/write for authenticated users (adjust policies as needed for your auth setup)
create policy "Allow public read" on teams for select using (true);
create policy "Allow public insert" on teams for insert with check (true);
create policy "Allow public update" on teams for update using (true);

-- Insert default team if none exists
insert into teams (name, color)
select 'マイチーム', '#3b82f6'
where not exists (select 1 from teams limit 1);
