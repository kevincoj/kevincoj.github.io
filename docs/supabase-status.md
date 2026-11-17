# Supabase setup status — 2026-11-17

Project: Kevin’s Portfolio (`fnpdxjxdymnnjcukcjeq`), in the Kevin Co Free organization. Project creation and Healthy status verified in the dashboard.

Applied `supabase/migrations/202611160001_completions.sql` through the authenticated SQL Editor inside an explicit transaction. Verified all three crossword tables exist, RLS is enabled, anon/authenticated SELECT access is denied, and server-role access is allowed. Configured `COMPLETION_TOKEN_SECRET` and `ALLOWED_ORIGINS` through the dashboard; no service keys were exposed or copied into browser code. The allowed frontend origin is currently the local preview, `http://127.0.0.1:63219`. Add the final hosted origin when chosen.

Function `completions` is deployed. Its full 6,514-character source matched the generated tested handler/adapter bundle before deployment. The user explicitly approved public invocation; JWT verification was turned off and saved in the function settings. The public endpoint is preconfigured in the local website. No real puzzles have been registered, no completion records have been created, and the portfolio itself has not been hosted publicly.

The migration was applied through the dashboard, not the CLI migration runner. Before any later `supabase db push`, link this project and mark version `202611160001` applied with `supabase migration repair 202611160001 --status applied`; inspect migration history first. Otherwise the CLI could attempt to recreate existing tables.

A private ignored `.env.completions` holds the generated hashing secret for recovery. Keep it private and stable; do not commit it or paste its values in chat.

## Live verification

- 7/7 HTTP checks passed against the deployed endpoint without API keys: CORS preflight 204, missing puzzle ID 400, unknown puzzle database lookup 404, unpublished-puzzle POST rejected with 404, malformed JSON 400, disallowed origin 403, invalid cursor 400.
- The SQL integration checks ran in the live project within an explicit rollback transaction: idempotent record insertion, own-name update, count isolation, 20+5 pagination for equal timestamps, anonymous-name exclusion, rate limiting, and permission denial for anon/authenticated roles all passed.
- A subsequent SELECT confirmed 0 registered puzzles and 0 completion records, proving test rows did not persist.
- The local preview is configured for the live endpoint. The public website is not hosted yet; no real owner puzzle has been supplied, so an actual browser solve against a registered real puzzle is still untested. Add the final website origin to ALLOWED_ORIGINS when hosting is selected.
