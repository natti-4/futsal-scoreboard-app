-- Function to increment player goals
create or replace function increment_player_goals(player_id_param uuid, goals_to_add int)
returns void
language plpgsql
security definer
as $$
begin
  update players
  set total_goals = total_goals + goals_to_add
  where id = player_id_param;
end;
$$;

-- Function to decrement player goals
create or replace function decrement_player_goals(player_id_param uuid, goals_to_subtract int)
returns void
language plpgsql
security definer
as $$
begin
  update players
  set total_goals = greatest(0, total_goals - goals_to_subtract)
  where id = player_id_param;
end;
$$;
