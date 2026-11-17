# Portfolio

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the user. Selected plain HTML, CSS, and JavaScript for a lightweight static portfolio with custom styling and reusable project presentation. Hosting is undecided.

## Users

Employers evaluating the owner's work, and other visitors interested in what the owner has built.

## Product Purpose

Give visitors a clear, attractive place to discover projects and understand the owner's contributions. Provide a reusable template as the project selection develops.

## Capabilities and Constraints

- Make projects easy to find and explore.
- Projects must be centered and visible immediately on the homepage, with few clicks and minimal copy.
- Include a dedicated crossword collection page (crosswords.html) and puzzle solving page (puzzle.html), with an interactive solver driven by interchangeable .puz files. Crosswords are secondary on the homepage.
- Solver behavior: selected-word and clue highlighting; independently centered clue lists; Space switches direction; Tab/Shift+Tab changes clues in that direction; typing overwrites the selected letter; Backspace/Delete erases and moves back once.
- Crossword session controls: themed Play/pause modals and a timer; Play, Pause and Settings keep the grid visible with blurred clues and disabled solving; Clear Word or Puzzle (whole-puzzle confirmation, no timer reset); Reveal Square/Word/Puzzle with distinct provenance; Check Autocheck/Square/Word/Puzzle with red error slashes and blue checked-correct letters.
- Revealed and checked-correct squares are permanent, including during scoped clearing. Whole-puzzle reveal needs confirmation. Correct completion stops the timer and offers read-only review or the crossword collection. Imported puzzles retain independent progress in sessionStorage within the current tab, across navigation and refresh. A published puzzle catalog is future work.
- Support optional special instructions and automatically checked meta answers configured per puzzle. Instructions appear before Play and in Puzzle info; grid completion keeps the grid available and directs to the separate meta form. Meta state is per puzzle within the tab.
- Keep shared portfolio navigation and a Home link on collection and solver pages. Apply the approved periwinkle, yellow and sage palette while preserving the compact solver footprint.
- Show the current clue above the grid with a soft-blue bar, bold number/direction and previous/next clue controls. Keep it synchronized and blur it with other clues when not playing.
- Opening a puzzle positions the solver immediately; the entire grid must fit in the solving viewport without page scrolling. Across/Down columns match the grid height and scroll internally.
- Puzzle settings: direction-changing arrows stay in place by default; Space toggles direction; backspacing into previous word defaults off; skip filled squares defaults on; both first-blank return and next-clue advance default on, with first-blank taking priority. Hide the caret. Include Restore defaults and Save and close; omit Interactions and penciled-square options.
- Support project summaries and more detailed explanations of contributions, decisions, evidence, and lessons.
- The project selection is provisional.
- Owner: Kevin Co, CS student at UCLA. Contact: kevinco@ucla.edu; LinkedIn https://www.linkedin.com/in/kevinco26; GitHub https://github.com/kevincoj. Résumé, hosting, project repositories and actual project recordings remain unprovided.
- Do not invent achievements, results, technologies used, or personal contributions.

## Brand Commitments

Latest visual direction: a puzzle-publication theme inspired by NYT Games, with nice simple colors, bold typography, crisp borders, and playful project presentation. Create an original personal identity. Projects remain the primary content; crosswords are secondary. The user requests visual examples before selecting a layout.

Clean, technical, friendly, and personal. Simplistic, with minimal text and restrained interaction. Avoid an obviously AI-generated appearance and generic promotional writing. Prior concepts were rejected as too text-heavy; they are not visual authority. The user requested a fresh design process using Impeccable, with projects as the central content and crosswords as a personal secondary space.

## Evidence on Hand

- TeachLA Coding Race: a coding platform for formative assessment and engagement in computer science classrooms; currently being worked on. Kevin is working with teachers at TeachLA @ UCLA; implementation details remain unconfirmed.
- Vid2Tab (formerly Tablature Stitcher): turns YouTube guitar tab videos into clean printable sheet music PDFs. Kevin built the Python pipeline with yt-dlp, ffmpeg and image processing, using Claude Code as an AI pair-programmer. It handles page changes/scrolling tabs, per-video crop confirmation, overlay/background cleanup, preserved notation/chord diagrams, and full-width justified PDF layout. Kevin explicitly confirmed the local web UI, sheet player and video play-along are available; hosted access is next. Supplied MP4/GIF walkthrough and before/after comparison are real project materials. Repository: https://github.com/kevincoj/Vid2Tab.
- Real Vid2Tab recordings and comparison image are supplied and used. TeachLA still uses a clearly labeled illustrative animation; no real TeachLA recording was supplied.
- Planning sources: https://dev.to/kethmars/what-i-learned-after-reviewing-over-40-developer-portfolios-9-tips-for-a-better-portfolio-4me7 and https://javascript.plainenglish.io/how-to-create-a-kick-ass-portfolio-site-that-will-wow-your-next-employer-5e5e2009222 . Only the public opening of the latter was accessible.

## Product Principles

- Lead with the work and make it understandable to employers.
- Demonstrate skills through specific evidence and accurate contributions.
- Make exploration and contact straightforward.
- Keep adding and updating projects manageable.
- Express personality through concrete content and considered design.
