# Completion tracker verification

Local implementation in the dedicated portfolio copy; no production Supabase project or live deployment connected.

- Baseline: 31 existing Node tests passed before changes.
- Final feature suites: 46 Node tests passed (catalog, persistence, original solver, policy, API and publishing).
- Browser: 7 Playwright scenarios passed at desktop and 390px mobile widths. Tests use real page scripts/shared API handler with intercepted test-only catalog/assets and an in-memory repository.
- Actual PostgreSQL 18: migration applied successfully; SQL checks passed for role denial/RLS grants, idempotency, names, independent counts, anonymous-record privacy and rate limiting.
- Concurrency: 16 concurrent PostgreSQL writes for one browser/puzzle produced exactly one row.
- Production catalog validation passed with 0 entries (intentional; no real puzzles supplied).
- Desktop and mobile screenshot artifacts inspected; the public list sits below the fitted board and the completion form fits the mobile viewport.
- `git diff --check` passed.

Not performed: deployed Supabase Edge Function smoke test, production frontend deployment, or a real owner-supplied puzzle test. These require project access and puzzle content. The Deno adapter has not been executed inside the Supabase cloud runtime; its shared handler and real SQL were tested separately.

See docs/deployment.md for the required live smoke test and secrets handling.
