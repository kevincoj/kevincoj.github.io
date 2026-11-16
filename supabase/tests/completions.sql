\set ON_ERROR_STOP on
begin;
insert into public.crossword_puzzles(id,revision) values('sql-mini','1'),('sql-other','1');
select public.crossword_record('sql-mini','hash-a','1');
select public.crossword_record('sql-mini','hash-a','1');
select public.crossword_record('sql-mini','hash-b','1');
select public.crossword_name('sql-mini','hash-a','Kevin','1');
do $$ begin
  if (select count(*) from public.crossword_completions where puzzle_id='sql-mini')<>2 then raise exception 'Duplicate increased count'; end if;
  if (public.crossword_summary('sql-mini')->>'count')::int<>2 then raise exception 'Wrong summary count'; end if;
  if jsonb_array_length(public.crossword_summary('sql-mini')->'solvers')<>1 then raise exception 'Anonymous name leaked'; end if;
  if (public.crossword_summary('sql-other')->>'count')::int<>0 then raise exception 'Puzzles not isolated'; end if;
  if public.crossword_name('sql-mini','missing','Nobody','1') is not null then raise exception 'Changed another browser'; end if;
  if public.crossword_limit('sql-test',1)<>true or public.crossword_limit('sql-test',1)<>false then raise exception 'Limiter failed'; end if;
end $$;
insert into public.crossword_puzzles(id,revision) values('page-test','1');
insert into public.crossword_completions(puzzle_id,browser_hash,name,completed_at)
select 'page-test','hash-'||n,'Solver '||n,'2026-11-16 12:00:00+00'::timestamptz from generate_series(1,25) n;
do $$ declare first_page jsonb; second_page jsonb; begin
 first_page:=public.crossword_summary('page-test');
 if jsonb_array_length(first_page->'solvers')<>20 then raise exception 'Wrong first page size'; end if;
 second_page:=public.crossword_summary('page-test',(first_page->'cursor'->>'at')::timestamptz,(first_page->'cursor'->>'id')::uuid);
 if jsonb_array_length(second_page->'solvers')<>5 or second_page->'cursor'<>'null'::jsonb then raise exception 'Wrong second page'; end if;
 if exists(select 1 from jsonb_array_elements(first_page->'solvers') a join jsonb_array_elements(second_page->'solvers') b on a->>'name'=b->>'name') then raise exception 'Repeated solver across pages'; end if;
end $$;

set local role anon;
do $$ begin
  begin perform * from public.crossword_completions; raise exception 'Anon table access allowed'; exception when insufficient_privilege then null; end;
  begin perform public.crossword_record('sql-mini','hash-c','1'); raise exception 'Anon RPC allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  begin perform * from public.crossword_completions; raise exception 'Authenticated table access allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
select public.crossword_record('sql-mini','hash-d','1');
reset role;
rollback;
