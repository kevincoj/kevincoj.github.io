# Implementation decisions and review disposition

- Work uses a separate copied repository because the original is outside this chat's writable workspace and is not a repository. Original source is preserved; later integration must explicitly use this copy.
- The shared API handler is JavaScript `.mjs`, executed unchanged in Node tests and Deno. This avoids test-only transpilation; the handler has fewer static TypeScript checks.
- Atomic database rate buckets allow 600 global requests/minute and 20 writes/browser/minute, with no IP storage or extra service. A determined abuser can temporarily exhaust the global budget.
- Retry state derives from durable eligible completed progress rather than a separate pending queue. Reopening a completed puzzle issues one harmless idempotent POST.
- The reviewer marked an inaccurate saved-progress promise Minor; it was regraded Important due to possible progress loss when leaving. The promise was removed; unavailable tracking copy is less specific but accurate.
- The reviewer marked collection status Minor; it was regraded Important because Not started contradicted durable progress. Cards show Progress saved/Continue based on revision-compatible metadata; they do not distinguish completed grids until opened.
- Deployed adapter behavior, production origins/credentials and real puzzle assets remain unverified without project access and owner content. A real deployment smoke test is required before live claims.

Independent review found no Critical issues. All four actionable findings were fixed with failing regressions followed by passing Node and browser suites. No deferred minor findings remain. Local branch `codex/crossword-completions` is preserved; nothing was merged, pushed or published.
