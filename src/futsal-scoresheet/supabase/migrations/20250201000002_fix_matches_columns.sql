-- matches テーブルが既に存在し、異なるカラム名の場合に使用
-- 状況に応じて以下のいずれかを実行してください

-- パターンA: home_score / away_score から self_score / opponent_score にリネームする場合
-- alter table matches rename column home_score to self_score;
-- alter table matches rename column away_score to opponent_score;

-- パターンB: self_score が存在しない場合、新規カラムを追加
-- （既存の home_score などがある場合はパターンAを使用）
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'matches' and column_name = 'self_score'
  ) then
    alter table matches add column self_score integer not null default 0;
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'matches' and column_name = 'opponent_score'
  ) then
    alter table matches add column opponent_score integer not null default 0;
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'matches' and column_name = 'opponent_name'
  ) then
    alter table matches add column opponent_name text not null default '';
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'matches' and column_name = 'match_date'
  ) then
    alter table matches add column match_date timestamptz not null default now();
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'matches' and column_name = 'duration_seconds'
  ) then
    alter table matches add column duration_seconds integer not null default 0;
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'matches' and column_name = 'photo_url'
  ) then
    alter table matches add column photo_url text;
  end if;
end $$;
