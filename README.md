# Kevin Co — portfolio

My personal projects and crosswords, built with HTML, CSS, and JavaScript.

- **Portfolio:** https://kevincoj.github.io/
- **Edit text:** https://app.pagescms.org/ — connect this repository once, then edit labeled fields and Save.
- **Editing guide:** [docs/editing.md](docs/editing.md)

The featured Vid2Tab project uses a real MP4 walkthrough, a still poster for reduced motion, a GIF fallback, and a before/after example. TeachLA Coding Race currently uses an illustrative animation. No crosswords are published yet.

## How it works

`content/*.json` stores editable text. `templates/*.html` preserves the page layout. `npm run build` escapes content into static HTML and copies only the website runtime into `dist`. Pages CMS writes content changes to GitHub; the Publish portfolio workflow runs checks and deploys `dist` to GitHub Pages.

The crossword player is custom browser-side JavaScript. Supabase handles optional completion tracking separately; see [deployment notes](docs/deployment.md). The empty collection does not call the completions API.

## Development

Requires Node.js 22+, npm, and Python 3 for the local preview server.

```sh
npm ci
npm run serve
```

After editing a content file while the server is running, run `npm run content` and refresh. For checks:

```sh
npm test
npm run validate:puzzles
npx playwright install chromium
npm run test:browser
npm run build
```

Website runtime: `outputs/portfolio-preview/`. Build output: `dist/`. Content/editor configuration: `content/` and `.pages.yml`. Do not edit generated `index.html` or `crosswords.html` directly; use their templates. Keep `.env*` files and backend credentials private.
