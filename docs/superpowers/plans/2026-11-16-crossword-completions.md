# Crossword Completions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add account-free public completion counts and optional solver names to Kevin's published crosswords.

**Architecture:** Keep the existing static portfolio. Publish puzzles through a static catalog, persist their progress by stable ID, and send eligible completion reports to a Supabase Edge Function backed by Postgres. The API accepts casual client reports; it does not claim verified unique people or competitive results.

**Tech Stack:** Existing HTML/CSS/JavaScript, Node test runner, Supabase Postgres, TypeScript/Deno Edge Function; Playwright for browser verification if available through installed tooling.

**Spec:** /Users/kevin/.codex/visualizations/2026/11/14/01a1dc41-fbd2-7270-a603-5bf5b66368b2/crossword-completions-design.md

## Global Constraints

- Public completion count and optional public solver names; no accounts, passwords, email collection, times, or rankings.
- Only published puzzles participate; local imports never submit completion reports.
- Hints and partial reveals are allowed; using Reveal Puzzle makes an attempt ineligible. A meta puzzle requires grid and meta completion.
- A repeated report from the same browser and puzzle must not increase the count.
- Display names are 1–40 Unicode code points after trimming and are rendered as plain text.
- Database credentials and browser identifier hashes are never public.
- Network/storage failures never block solving; unsuccessful submissions remain retryable.
- Preserve the solver's viewport footprint and the portfolio's existing visual theme.
- No real puzzles have been supplied: production catalog starts empty; fixtures must remain explicitly test-only.
- Use a separate writable portfolio copy; preserve the original and leave Tabsheet untouched.
- Never claim production readiness without real deployed verification. Prepare local work before the Supabase access handoff.

## Working Paths and Ownership

Execution root: `/Users/kevin/.codex/visualizations/2026/11/14/01a1dc41-fbd2-7270-a603-5bf5b66368b2/portfolio`.

Original root (read only during this work): `/Users/kevin/Documents/Codex/2026-10-23/i-wan`.

Keep `outputs/portfolio-preview` as the web root and copy the existing four `work/crossword-qa/*.test.cjs` files so their relative imports remain valid. Copy only website runtime files/assets and relevant test fixtures; omit historical screenshots and ad hoc preview pages. Add `package.json` with `test` and `serve` scripts and a `.gitignore` before initializing a dedicated repository. Do not initialize or modify Git in the source folder or Tabsheet. Use `codex/crossword-completions` for the implementation branch. Preserve the approved spec alongside this plan under `docs/superpowers/specs/`.

## Review Focus

- Published puzzle content changes under an existing ID: store a content revision and discard incompatible saved progress rather than reporting a stale solve.
- Two tabs finish/retry simultaneously: database uniqueness and atomic writes must prevent duplicate counts.
- User hits Reveal Puzzle after filling most squares: track the action explicitly; counting revealed squares alone is insufficient.
- Browser storage is denied or corrupt: continue solving, show an accurate persistence notice, and avoid automatic reports without a durable browser identity.
- Out-of-order responses and late network errors: never apply one puzzle's counts or success message to another puzzle, and preserve retry state on failure.

---

### Task 1: Published catalog and durable progress

**Files:** Create `outputs/portfolio-preview/puzzle-catalog.json`, `crossword-catalog.js`, `crossword-storage.js`; modify `crossword.js`, `crossword-session.js`, `crosswords.html`, `puzzle.html` in the same folder. Create `work/crossword-qa/catalog.test.cjs` and `storage.test.cjs`.

**Interfaces:** `loadCatalog({fetchImpl, baseUrl}) -> Promise<CatalogEntry[]>`; entries contain `{id, revision, title, author, file, publishedAt, details?}`. `loadPublishedPuzzle(entry, fetchImpl) -> Promise<Puzzle>` uses the existing parser after fetch. Storage exposes `readPublished(id, revision)` and `writePublished(id, revision, snapshot)`; records have `publishedId` and `revision`. Keep local import state in sessionStorage and published state in localStorage.

- [x] Copy runtime files/tests into the execution root, initialize the isolated repository, and verify the four existing regression suites pass before modifications.
- [x] Add tests asserting: empty catalog returns `[]`; duplicate or malformed IDs/revisions and nonlocal asset paths are rejected; a fresh browser resolves a stable published URL without prior import; mismatched revisions ignore saved progress; corrupt individual snapshots do not discard other puzzles; unavailable storage returns a recoverable status.
- [x] Run `node --test work/crossword-qa/catalog.test.cjs work/crossword-qa/storage.test.cjs`; confirm meaningful failures before implementation.
- [x] Implement catalog parsing/loading and storage isolation. Extract `parsePuz` only if required for independent testing; preserve current format limitations.
- [x] Replace collection startup and puzzle routing with asynchronous catalog initialization. Keep local imports accessible only through an explicit development mode, preserving existing UUID routes for those imports. Published routes use `puzzle.html?id=<stable-id>` and resolve from the catalog. Show accurate empty, loading, failed, and missing-puzzle states without redirect loops.
- [x] Save published progress after answer/meta/settings changes with a short debounce, on visibility changes, and pagehide; pause restored active games. Validate restored completed state against current answers rather than trusting a saved phase flag.
- [x] Run new and existing Node tests, then commit the independently usable catalog and persistence change.

### Task 2: Supabase schema and completion API

**Files:** Create `supabase/config.toml`, `supabase/migrations/202611160001_completions.sql`, `supabase/functions/completions/index.ts`, `supabase/functions/completions/handler.ts`, `supabase/tests/completions.sql`, `work/crossword-qa/completion-api.test.cjs`, and `outputs/portfolio-preview/completion-policy.js`.

**Interfaces:** `GET /completions?puzzleId=<id>&cursor=<opaque>` returns `{count, solvers:[{name, completedAt}], nextCursor}` with 20 names per page. `POST /completions` accepts `{puzzleId, revision, browserToken}` and returns the same count plus `{recorded:true,name:null|string}`. `PATCH /completions` accepts `{puzzleId,revision,browserToken,name}` and adds/changes the caller's own name without adding a completion. No browser token goes in a URL. Server owns timestamps and IDs. `createCompletionHandler({repository,hashToken,rateLimit,allowedOrigin})` is injectable for tests; production adapter uses Supabase credentials only server-side.

- [x] Add tests asserting unknown/unpublished IDs yield 404; stale revisions yield 409; malformed bodies, non-UUID browser tokens, control characters and names over 40 code points yield 400; missing completion on name update fails; whitespace is normalized; duplicate posts return recorded state without another insertion; names like `<img src=x>` remain plain data; responses contain no token/hash/private fields; invalid cursor and oversized request fail; rate limits yield 429; allowed-origin OPTIONS succeeds.
- [x] Run the handler tests and confirm they fail before implementation. Use a plain JavaScript shared handler if required to execute the same source in Node and Deno without compilation.
- [x] Implement tables for allowed published puzzle IDs/revisions and completions, with unique `(puzzle_id,browser_hash)`, server timestamps, length constraints, and pagination index `(puzzle_id, completed_at, id)`. Deny anon/authenticated access to private tables using grants and RLS.
- [x] Implement atomic database operations for idempotent insertion, named updates, counts and stable cursor pagination. Hash browser tokens with a server secret. Use bounded, server-enforced request limiting, including a global cap and per-browser write cap; do not treat CORS as authentication or browser tokens as unique-human proof.
- [x] Implement the intentionally public Edge Function with explicit request validation, bounded body size, public-response projection, CORS allowlist, and private credentials. Avoid raw IP storage; if an IP bucket is used, hash it with a server secret and expire limiter records. Define concrete limiter thresholds in configuration and tests.
- [x] Write SQL integration checks for RLS denial, concurrent duplicate insertion, atomic name update without count growth, independent puzzle counts, and exclusion of anonymous records from named pagination.
- [x] Run handler tests and Supabase SQL integration checks locally if the CLI/database runtime is available. Record any unavailable integration environment explicitly; do not substitute mocked tests for a claimed real SQL pass. Commit backend deliverables.

### Task 3: Client submission and public solver UI

**Files:** Create `outputs/portfolio-preview/completions-config.js`, `crossword-completions.js`, `crossword-completions-view.js`; modify `crossword.js`, `crossword-game.js`, `crossword-session.js`, `crosswords.html`, `puzzle.html`, `crosswords.css`. Create `work/crossword-qa/completions.test.cjs` and browser flow checks.

**Interfaces:** `isCompletionEligible(record) -> boolean` requires a published ID, completed grid, required meta solved, and no full-puzzle-reveal action. `createCompletionClient({baseUrl,fetchImpl,storage,randomUUID})` exposes `getSummary(puzzleId,cursor)`, `record(puzzleId,revision)`, and `setName(puzzleId,revision,name)`. Store one durable random browser token separately from progress. A UI controller owns request cancellation/generation per puzzle and renders plain-text names.

- [x] Write failing tests for grid/meta eligibility, whole-puzzle reveal after partial solving, partial reveals, reload recovery, durable identity reuse, unavailable identity storage, retries after timeout, concurrent local calls, unchanged count after name submission, and ignoring stale responses after navigation.
- [x] Run `node --test work/crossword-qa/completions.test.cjs`, confirm intended failures, then implement the policy and client. Persist an explicit whole-puzzle-reveal flag in snapshots; do not infer the action solely from `revealed.size`.
- [x] Hook submission into both grid completion and successful meta completion, including eligible restored completed puzzles. Automatic anonymous reports are idempotent. Persist pending status and offer retry; success state requires server acknowledgement. With missing backend config show setup/unavailable messaging, never fake counts.
- [x] Add a compact completion dialog section with an optional name field, clear public-name disclosure, submit state, inline errors and retry. Do not submit names on typing or hide existing navigation actions. Make name entry available after the dialog is reopened.
- [x] Display completion counts on catalog cards and a paginated named solver list below the puzzle board. Empty, loading and unavailable states are distinct. Use textContent, accessible labels/status regions, disabled duplicate actions, and existing theme tokens. Keep the board sizing calculation unchanged.
- [x] Exercise two simulated browsers against an injected API: complete, skip name, add name, reload, retry, paginate and switch puzzles midrequest. Verify anonymous completion increments count without appearing as a named solver. Repeat with meta/reveal cases and storage/network denial.
- [x] Run Node regression suites and browser checks, inspect desktop/mobile screenshots, then commit the client/UI change.

### Task 4: Publishing, deployment and whole-change verification

**Files:** Update `README.md`; create `docs/deployment.md`, `scripts/validate-puzzles.mjs`, `scripts/export-puzzle-registry.mjs`, `.github/workflows/test.yml`, and `work/crossword-qa/verification-results.md`.

**Interfaces:** `node scripts/validate-puzzles.mjs` validates the static catalog/assets. `node scripts/export-puzzle-registry.mjs` produces owner-reviewed SQL for approved catalog IDs/revisions; no database secrets and no automatic remote mutations. `npm test` runs the complete local regression suite.

- [x] Document publishing a new puzzle, selecting an immutable revision, configuring instructions/meta answers, synchronizing the server allowlist, enabling the backend URL, removing abusive names in the dashboard, and retry behavior. Include `.puz` answer visibility and casual-tracker limitations.
- [x] Add validation tests that all catalog assets exist, JSON shape is correct and duplicate IDs are rejected. Production catalog remains empty until real puzzles are supplied; browser fixtures are served only through a test fixture path and never registered for production.
- [x] Document Supabase project creation/linking, migration and Edge Function deployment commands, secret names, public-function auth configuration, allowed frontend origins and a smoke test that exercises real inserts and duplicate protection. Do not ask for secrets in chat.
- [x] Run all available Node, catalog, SQL and browser checks; use `git diff --check` and inspect the final diff. Record commands, outcomes and any skipped runtime-dependent checks. Run a fresh whole-change reviewer following the execution skill; fix material findings and rerun affected checks.
- [x] Hand over the local implementation and list the exact production access needed. If project access is available, deploy only after local verification and then run the real smoke test. Otherwise clearly report that live tracking remains unconnected, with setup files ready.

## Execution Handoff

Recommended execution method: native implementation in this chat with one fresh whole-change reviewer. The tasks share catalog/record interfaces and a small existing solver; implementing them together minimizes handoff overhead. Approved for native execution by the user. Local tasks implemented; production project connection remains an external prerequisite.
