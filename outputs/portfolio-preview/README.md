# Portfolio and dedicated crossword pages

Run `python3 -m http.server 63218 --bind 127.0.0.1 --directory outputs/portfolio-preview` from the workspace root.

- `index.html`: portfolio, project previews and link to Crosswords.
- `crosswords.html`: collection and local `.puz` importer.
- `puzzle.html?id=…`: dedicated solver. Import/select a puzzle from the collection first.
- `portfolio.js`: illustrative project animations and homepage controls.
- `crossword.js`: parser, collection, solver UI and navigation.
- `crosswords.css`: compact solver header, bounded clue columns and collection styling.
- `crossword-game.js`: answers, locks, timer and checking.
- `crossword-navigation.js`: configurable keyboard movement.
- `crossword-session.js`: tab-local progress snapshots and restoration.
- `puzzle-details.js`: optional puzzle instructions and accepted meta answers.

This remains a local design prototype. Kevin Co’s identity, UCLA introduction, contact links and project descriptions have been added from supplied information. Project recordings, résumé and project-specific source/demo links remain unprovided. Canvas animations are illustrations, not recordings of real projects. Local video previews are not uploaded or persisted.

## Crossword behavior

The full grid fits the available solving viewport, with a compact title/byline, toolbar and current-clue bar. The centered board-and-clues group uses bounded clue columns; both match grid height and scroll independently. Arrow clue buttons, selected word/tile highlights, centered clue selection, Space direction changes, Tab/Shift+Tab clue navigation and overwrite entry are supported. Settings controls arrow direction changes, Space behavior, backspacing across words, skipping filled cells and end-of-word actions.

Play begins the timer. Pause, Settings and Puzzle info stop time; the board stays visible and clues are blurred. Clear offers Word/Puzzle with full-puzzle confirmation. Reveal offers Square/Word/Puzzle with full-puzzle confirmation. Check offers Autocheck/Square/Word/Puzzle. Verified/revealed answers are permanent. Correct completion stops the timer and allows read-only review. Meta puzzles also offer Solve the meta.

Imported puzzles, entries, marks, elapsed time, selection, settings and meta progress stay in this tab’s sessionStorage across page navigation and refresh. Closing the tab ends that session. Reloading an unfinished puzzle resumes paused. Puzzle URLs identify records in that tab; they are not yet shareable published puzzle URLs. Current source answers are browser-local, not suitable for secure competition submissions.

## Special instructions and meta answers

Add an entry to the CROSSWORD_DETAILS array in puzzle-details.js, matching the exact `.puz` title and optionally author:

```js
{
  title: 'Your puzzle title',
  instructions: 'Complete the grid, then look for a guiding light.',
  meta: { prompt: 'Which star is hidden in the grid?', answers: ['North Star', 'Polaris'] }
}
```

Instructions appear before Play and in Puzzle info. Meta forms accept configured alternatives and ignore case, spacing and punctuation. Ordinary puzzles show no meta form. No actual user meta answers are configured yet. The importer does not yet read the `.puz` Notes field. Rebus, circles, diagramless grids and checksum verification remain unsupported. Locked/answerless files disable Reveal/Check.

## Verification

Run `node --test work/crossword-qa/game.test.cjs work/crossword-qa/navigation.test.cjs work/crossword-qa/meta.test.cjs work/crossword-qa/session.test.cjs` from the workspace root.

Format reference: https://github.com/alexdej/puzpy . Fonts: self-hosted Newsreader and DM Sans; upstream licenses at https://github.com/google/fonts/tree/main/ofl/newsreader and https://github.com/google/fonts/tree/main/ofl/dmsans .

The collection and solver share portfolio navigation with explicit Home links and a linked wordmark. The collection uses the periwinkle/yellow/sage palette. The solver keeps its compact header footprint and adds sage toolbar/yellow timer accents; the 21×21 board remains486px in the720px-height desktop verification.
