-- Casual client-reported completions. Never expose these tables directly.
create table public.crossword_puzzles (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  revision text not null check (revision ~ '^[a-zA-Z0-9._-]{1,80}$'),
  published boolean not null default true
);
create table public.crossword_completions (
  id uuid primary key default gen_random_uuid(),
  puzzle_id text not null references public.crossword_puzzles(id),
  browser_hash text not null,
  completed_at timestamptz not null default clock_timestamp(),
  name text check (name is null or (char_length(name) between 1 and 40 and name !~ '[[:cntrl:]]')),
  unique (puzzle_id, browser_hash)
);
create index crossword_named_page on public.crossword_completions(puzzle_id,completed_at desc,id desc) where name is not null;
create table public.crossword_rate_limits (
  bucket text not null, window_start timestamptz not null, hits integer not null, primary key(bucket,window_start)
);
alter table public.crossword_puzzles enable row level security;
alter table public.crossword_completions enable row level security;
alter table public.crossword_rate_limits enable row level security;
revoke all on public.crossword_puzzles,public.crossword_completions,public.crossword_rate_limits from public,anon,authenticated;
grant all on public.crossword_puzzles,public.crossword_completions,public.crossword_rate_limits to service_role;

create function public.crossword_limit(p_bucket text,p_limit integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare n integer; w timestamptz := date_trunc('minute',clock_timestamp());
begin
  delete from public.crossword_rate_limits where window_start < w - interval '5 minutes';
  insert into public.crossword_rate_limits values(p_bucket,w,1)
  on conflict(bucket,window_start) do update set hits=public.crossword_rate_limits.hits+1 returning hits into n;
  return n<=p_limit;
end; $$;

create function public.crossword_record(p_puzzle_id text,p_browser_hash text,p_revision text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  perform 1 from public.crossword_puzzles where id=p_puzzle_id and revision=p_revision and published for share;
  if not found then raise exception 'Unpublished or outdated puzzle'; end if;
  insert into public.crossword_completions(puzzle_id,browser_hash) values(p_puzzle_id,p_browser_hash)
  on conflict(puzzle_id,browser_hash) do nothing;
  select jsonb_build_object('name',c.name) into result from public.crossword_completions c where puzzle_id=p_puzzle_id and browser_hash=p_browser_hash;
  return result;
end; $$;

create function public.crossword_name(p_puzzle_id text,p_browser_hash text,p_name text,p_revision text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  perform 1 from public.crossword_puzzles where id=p_puzzle_id and revision=p_revision and published for share;
  if not found then raise exception 'Unpublished or outdated puzzle'; end if;
  update public.crossword_completions set name=p_name where puzzle_id=p_puzzle_id and browser_hash=p_browser_hash returning jsonb_build_object('name',name) into result;
  return result;
end; $$;

create function public.crossword_summary(p_puzzle_id text,p_cursor_at timestamptz default null,p_cursor_id uuid default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  with page as (
    select id,name,completed_at from public.crossword_completions
    where puzzle_id=p_puzzle_id and name is not null
      and (p_cursor_at is null or (completed_at,id)<(p_cursor_at,p_cursor_id))
    order by completed_at desc,id desc limit 21
  ), visible as (select * from page order by completed_at desc,id desc limit 20)
  select jsonb_build_object(
    'count',(select count(*) from public.crossword_completions where puzzle_id=p_puzzle_id),
    'solvers',coalesce((select jsonb_agg(jsonb_build_object('name',name,'completedAt',completed_at) order by completed_at desc,id desc) from visible),'[]'::jsonb),
    'cursor',case when (select count(*) from page)>20 then (select jsonb_build_object('at',completed_at,'id',id) from visible order by completed_at,id limit 1) else null end
  );
$$;
revoke all on function public.crossword_limit(text,integer),public.crossword_record(text,text,text),public.crossword_name(text,text,text,text),public.crossword_summary(text,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.crossword_limit(text,integer),public.crossword_record(text,text,text),public.crossword_name(text,text,text,text),public.crossword_summary(text,timestamptz,uuid) to service_role;
