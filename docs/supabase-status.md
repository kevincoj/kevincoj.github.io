# Supabase setup status — 2026-11-17

Project: Kevin’s Portfolio (`fnpdxjxdymnnjcukcjeq`), in the Kevin Co Free organization. Project creation and Healthy status verified in the dashboard.

Applied `supabase/migrations/202611160001_completions.sql` through the authenticated SQL Editor inside an explicit transaction. Verified all three crossword tables exist. Configured `COMPLETION_TOKEN_SECRET` and `ALLOWED_ORIGINS` through the dashboard; no service keys were exposed or copied into browser code. The allowed frontend origin is currently the local preview, `http://127.0.0.1:63219`. Add the final hosted origin when chosen.

Function source is prepared in the dashboard as `completions`; its full 6,514 characters matched the generated tested handler/adapter bundle. Deployment and public invocation are pending the browser security confirmation. The public endpoint is preconfigured in the local website. No real puzzles have been registered, no completion records have been created, and the portfolio itself has not been hosted publicly.

The migration was applied through the dashboard, not the CLI migration runner. Before any later `supabase db push`, link this project and mark version `202611160001` applied with `supabase migration repair 202611160001 --status applied`; inspect migration history first. Otherwise the CLI could attempt to recreate existing tables.

A private ignored `.env.completions` holds the generated hashing secret for recovery. Keep it private and stable; do not commit it or paste its values in chat.
