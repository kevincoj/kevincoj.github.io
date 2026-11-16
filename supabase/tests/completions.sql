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
