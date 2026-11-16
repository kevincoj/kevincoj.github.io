# Deployment and puzzle publishing

## What is ready and what needs access

The static site, Supabase SQL schema, public Edge Function, tests, and setup files are local. No Supabase project or live tracking has been created or connected. To deploy, use a Supabase account/project you control and a static website host. Do not paste passwords, access tokens, service-role keys or token secrets into chat.

The website can use GitHub Pages; only publish `outputs/portfolio-preview/`, not the repository, tests or secret files. Add the final website origin to the function's allowlist. No visitor accounts or Supabase Auth sign-in are used.

## Backend setup

Install the Supabase CLI using its official instructions, then authenticate locally:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This migration creates new `crossword_*` tables and service-only RPC functions. Review changes before using an existing shared project. Tables deny anon/authenticated access; all reads and writes go through the validated function. Project-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` remain server-side.

Create a private `.env.completions` file at the repository root (ignored by Git). Fill it locally:

```dotenv
COMPLETION_TOKEN_SECRET=REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS
ALLOWED_ORIGINS=https://YOUR_SITE_ORIGIN,http://127.0.0.1:63219
```

Generate a secret locally with `openssl rand -hex 32`. Keep it stable: changing it changes the browser identity hashes, which can allow repeat counting. Use exact origins with schemes and ports, no paths or trailing slash. Remove the local origin when no longer needed.

```sh
supabase secrets set --env-file .env.completions
supabase functions deploy completions
```

`supabase/config.toml` intentionally sets `verify_jwt = false` for this public, account-free endpoint. Input validation, RLS/grants, rate limiting and private database credentials provide the access boundary. CORS alone is not authentication. See [public function security](https://supabase.com/docs/guides/functions/auth), [deploying functions](https://supabase.com/docs/guides/functions/deploy), and [function secrets](https://supabase.com/docs/guides/functions/secrets).

Set the public endpoint in `outputs/portfolio-preview/completions-config.js`:

```js
window.CROSSWORD_COMPLETIONS_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/completions';
```

No API key belongs in the website. Publish that config with the website files after verifying the backend.

## Publishing a puzzle

1. Put the real puzzle file under `outputs/portfolio-preview/puzzles/`.
2. Add a catalog entry with a permanent ID and explicit revision:

```json
{
  "id": "first-crossword",
  "revision": "1",
  "title": "Your actual title",
  "author": "Kevin Co",
  "file": "puzzles/first-crossword.puz",
  "publishedAt": "2026-11-16",
  "details": {
    "instructions": "Optional instructions",
    "meta": {"prompt": "Optional final question", "answers": ["Accepted answer"]}
  }
}
```

Omit `meta` for ordinary crosswords. This is an example only; there are no invented puzzles in the production catalog. Basic rectangular single-letter .puz files must contain unlocked answers. Solutions and meta answers are visible in downloaded assets; this is a casual tracker, not secure competition software.

3. Run `npm run validate:puzzles`.
4. Run `node scripts/export-puzzle-registry.mjs > /tmp/portfolio-puzzle-registry.sql`. Review the SQL and apply it through the Supabase SQL editor. It upserts catalog IDs/revisions and does not automatically hide omitted puzzles. No secrets are needed to generate it.
5. Publish the website files. Open `puzzle.html?id=first-crossword` in a fresh browser to verify the permanent link.

Treat IDs and revisions as immutable content identities. Increment the revision and change the asset filename whenever the grid, clues or meta rules change; this invalidates incompatible local progress. Completion counts remain attached to the permanent puzzle ID across revisions. For a substantially different puzzle, give it a new ID. Preserve old filenames/IDs when keeping old links alive.

To unpublish a puzzle, set its backend `published=false` and remove the catalog entry; remove both so old clients cannot keep submitting. The export script deliberately does not make destructive decisions about missing entries.

## Required live smoke test

Using a real registered puzzle in a staging project first:

1. Confirm GET returns a count and no private fields.
2. Solve in a fresh browser. Confirm one anonymous completion, then add a name and verify it is public.
3. Reload the completed puzzle and reopen its completion dialog: the count stays unchanged.
4. Solve in another browser: the count increases by one.
5. Test malformed requests, stale revisions, unknown puzzles and repeated submissions. Confirm HTTP 400/404/409/429 behavior as applicable.
6. Confirm direct anon/authenticated table/RPC access is denied, and inspect server logs without logging browser tokens or secrets.

Do not label the site live/verified until these checks run against the deployed function and website. Local browser tests exercise the real shared handler with an in-memory repository, while separate SQL tests exercise the real Postgres schema; they are not a deployed Supabase smoke test.

## Behavior and moderation

- A completed published grid counts once per browser identifier; meta puzzles require the meta answer too.
- Hints and partial reveals are allowed. Choosing Reveal Puzzle makes the attempt ineligible, including after reload.
- Names are optional, plain text, 1–40 Unicode code points, and explicitly public. Anonymous completions affect only the count.
- Progress and a random browser identifier use localStorage. If browser storage is denied, solving still works but tracking cannot submit. Imports use sessionStorage.
- Timeouts and failed writes are retryable. Reloading an eligible completed puzzle retries with the same token; the database deduplicates it. Offline progress persists when storage is available.
- Counts represent reported completions, not verified unique people. Clearing browser storage can allow another report.
- In the Supabase dashboard, clear a completion's `name` to hide abuse while preserving its count; delete a completion to remove the count too. There is no public deletion endpoint. Names can reappear if that browser submits again; stronger moderation is future work.
- Atomic rate buckets permit 600 API requests globally per minute and 20 writes per browser per minute; excess requests receive 429. No raw IP data is stored. A determined spammer can temporarily consume the global limit; monitor function usage and adjust limits if needed.

## Tests and CI

```sh
npm test
npm run validate:puzzles
npx playwright install chromium
npm run test:browser
```

Browser tests intercept only test routes; they do not publish fixtures. GitHub Actions runs the Node, catalog and browser checks using [Playwright's CI flow](https://playwright.dev/docs/ci).

For a disposable Postgres instance with Supabase roles `anon`, `authenticated`, `service_role`, apply the migration then run `psql -v ON_ERROR_STOP=1 -f supabase/tests/completions.sql`. The tests roll back their rows. The concurrency helper is specifically configured for the temporary local development instance; inspect it before running. Never point test fixtures at production.
