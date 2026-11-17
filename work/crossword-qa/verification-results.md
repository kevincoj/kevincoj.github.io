# Completion tracker verification

Implementation is in the dedicated portfolio copy. Supabase is now deployed and connected to the local preview; see the live verification section below.

- Baseline: 31 existing Node tests passed before changes.
- Final feature suites: 47 Node tests passed (catalog, persistence, original solver, policy, API and publishing).
- Browser: 12 Playwright scenarios passed at desktop and 390px mobile widths. Tests use real page scripts/shared API handler with intercepted test-only catalog/assets and an in-memory repository.
- Actual PostgreSQL 18: migration applied successfully; SQL checks passed for role denial/RLS grants, idempotency, names, independent counts, anonymous-record privacy and rate limiting.
- Concurrency: 16 concurrent PostgreSQL writes for one browser/puzzle produced exactly one row.
- Production catalog validation passed with 0 entries (intentional; no real puzzles supplied).
- Desktop and mobile screenshot artifacts inspected; the public list sits below the fitted board and the completion form fits the mobile viewport.
- `git diff --check` passed.

Not performed: production frontend deployment or a real owner-supplied puzzle solve. The Deno adapter now runs in Supabase and passed the live validation/connectivity checks described below; a successful real-puzzle submission still needs the owner’s puzzle content.

See docs/deployment.md for the required live smoke test and secrets handling.

Independent whole-branch review found a first-use cross-tab identity race and invisible puzzle errors, plus misleading storage and collection-status copy. All four were covered by failing regressions and fixed. The final 47 Node tests and 12 browser tests passed. Cross-tab initialization now uses a shared Web Lock; unsupported/insecure browser contexts can still solve but do not submit. SQL pagination was additionally verified with 25 solvers at identical timestamps, returning 20+5 without overlap.

## Live deployment verification — 2026-11-17

The Supabase function is deployed with account-free invocation enabled after explicit user approval. Seven real HTTP checks passed, including a database-backed unknown-puzzle lookup, CORS and validation failures. The full SQL integration script also passed against the live project in a rollback transaction. Final database counts were 0 registered puzzles and 0 completions. The local preview points to the live API. A real published-puzzle browser solve and publicly hosted frontend verification remain outstanding until puzzle content and hosting are supplied.
