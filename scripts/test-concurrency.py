"""Integration check against an explicitly selected disposable PostgreSQL server."""
import concurrent.futures,os,subprocess
psql=os.environ.get('PSQL','/opt/homebrew/opt/postgresql@18/bin/psql')
args=[psql,'-h','/private/tmp/portfolio-completions-socket','-p','56328','-U','portfolio','-d','postgres','-v','ON_ERROR_STOP=1','-At']
def query(sql):return subprocess.check_output(args+['-c',sql],text=True).strip()
query("insert into public.crossword_puzzles(id,revision) values('concurrent-test','1') on conflict do nothing")
try:
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(lambda _:query("select public.crossword_record('concurrent-test','same-browser','1')"),range(16)))
 assert query("select count(*) from public.crossword_completions where puzzle_id='concurrent-test'")=='1'
 print('PASS: 16 concurrent submissions create exactly one completion')
finally:
 query("delete from public.crossword_completions where puzzle_id='concurrent-test'; delete from public.crossword_puzzles where id='concurrent-test'")
