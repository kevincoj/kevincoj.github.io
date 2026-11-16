# Kevin Co's portfolio

A separate working copy of the original portfolio, extended with published crosswords and an account-free completion tracker. The portfolio remains static HTML/CSS/JavaScript. Supabase stores completion reports and optional public solver names.

```sh
npm ci
npm test
npm run serve
```

Open http://127.0.0.1:63219/ . The production puzzle catalog is intentionally empty until Kevin supplies puzzles. No live database has been connected: completion counts require the backend configuration in [Deployment](docs/deployment.md).

- Website files: `outputs/portfolio-preview/` (this is the folder to publish).
- Puzzle publishing: `puzzle-catalog.json`, bundled `puzzles/*.puz`, then `npm run validate:puzzles`.
- Development-only imports: `crosswords.html?dev=1`. Imports stay in the browser tab and do not submit completions.
- Backend: `supabase/migrations/` and `supabase/functions/completions/`.
- Node tests: `npm test`; browser tests: `npx playwright install chromium`, then `npm run test:browser`.
- Original project: `/Users/kevin/Documents/Codex/2026-10-23/i-wan` was preserved.

Project animations remain illustrative; real recordings, project links and résumé still need the owner's content. The original solver supports basic rectangular .puz puzzles; rebus/circles and locked solutions are unsupported. Read [deployment and publishing instructions](docs/deployment.md) before making the site public.
