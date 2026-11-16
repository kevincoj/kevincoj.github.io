# Crossword completions

## Intent and agreed direction
Kevin wants an account-free portfolio with a public completion count and optional public solver names for each crossword. He selected a managed backend and delegated its technical selection. No ranked leaderboard, accounts, email collection, or passwords.

## Approach
Use Supabase Postgres and a public Edge Function API, while retaining the existing HTML/CSS/JavaScript frontend. This is the implementer's choice. A self-managed server was considered and rejected for its extra operational maintenance. A browser-only solution cannot share completion records among visitors.

## Visitor experience
Only published puzzles participate. Completing an eligible puzzle submits one anonymous completion and offers an optional display-name form labeled clearly as public. Skipping the name still counts. Show a count on puzzle collection cards and the puzzle page, plus a paginated list of named solvers on the puzzle page. No times or rankings. Keep this below the solver so the board retains its current size.

Proposed defaults: assistance is allowed, but revealing the entire grid does not count. For puzzles with a meta answer, require both the grid and meta. Name length is 1–40 characters; render names as plain text. Network failures never block solving and offer retry. Do not show a successful submission until confirmed by the backend.

## Publishing prerequisite
The current prototype imports puzzles into tab-local sessionStorage. Add an owner-maintained static catalog with stable puzzle IDs and bundled .puz assets, making puzzle URLs shareable. Preserve local imports for development, but do not submit their completions. Persist published puzzle progress across visits using stable IDs. Publish no invented sample puzzle as Kevin's own work; support an honest empty catalog until he supplies puzzles.

## Backend and records
Tables: published puzzle IDs and completion records. Each completion has puzzle ID, server timestamp, a private random browser identifier hash, and an optional public name. A unique constraint on puzzle ID plus browser hash makes retries idempotent. Store the random identifier in localStorage; never return identifiers in public API responses. Names can be added to the matching completion using that browser token, without increasing the count. Do not provide public editing or deletion of other records.

The API validates inputs, rejects unknown/unpublished puzzle IDs, applies request limits, and exposes only counts and paginated display names/dates. Browser database access is denied with RLS; privileged database credentials stay inside the function. SQL changes to counts and names must be atomic. Owner can remove abusive names through the Supabase dashboard; count may remain if just the name is removed.

This is a casual completion tracker: client-reported completion and browser deduplication are not proof of a human solve or unique person. Browser storage can be cleared. Document that limitation; do not present the count as verified unique people. Do not add competition-grade hidden answers or timing validation.

## Delivery and verification
Implement catalog, stable progress, completion API/migrations, UI, and setup documentation. Test rejection of invalid puzzles/names, duplicate and concurrent submissions, public response privacy, name updates, offline retry, grid/meta eligibility, and existing solver regression checks. Verify the completed flow and layout on desktop and mobile.

Production setup requires Kevin's Supabase project access. Prepare all local code, SQL, configuration and deployment instructions before that handoff. Never ask him to paste secrets into chat. Creating a production project or claiming live tracking is complete must wait for access and successful deployed verification.

## Working location
Existing source: /Users/kevin/Documents/Codex/2026-10-23/i-wan/outputs/portfolio-preview. This lies outside this chat's writable workspace. Implementation should use a dedicated copy inside an allowed workspace or an approved project checkout, preserving the original until integration.

## Source
Supabase supports intentionally public Edge Functions without user sign-in: https://supabase.com/docs/guides/functions/auth
