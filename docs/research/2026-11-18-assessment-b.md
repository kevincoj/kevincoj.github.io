# Independent Assessment B — Portfolio

Date: 2026-11-18. Target: `templates/index.html`; rendered target: `outputs/portfolio-preview/index.html`; live URL: `http://127.0.0.1:4318/`.

This assessment used the current rendered implementation as visual authority. The brief is an original personal identity inspired by NYT Games, projects primary, factual text preserved. Assessment B did not read Assessment A or previous critique reports. The supplied brief substituted for a separate interview in this delegated evidence pass. No website or skill files were changed.

## Deterministic detector

Command actually executed:

```sh
sh /Users/kevin/.codex/skills/impeccable/scripts/impeccable detect --json outputs/portfolio-preview/index.html
```

Exit code **2**, meaning findings, not execution failure. **3 warnings**, **3 distinct rules**, all reported against `/Users/kevin/.codex/worktrees/portfolio-pastel-controls/portfolio/outputs/portfolio-preview/index.html`, line **0**. The detector supplies no useful source line numbers; locations below come from independent source inspection.

| Rule | Exact detector snippet | Evaluation and source location |
| --- | --- | --- |
| `undersized-ui-text` | `9px functional text "In progress" (below 11px floor)` | Valid. `.status` is 10px desktop, 9px at widths <=800px, in `outputs/portfolio-preview/style.css:1`. Browser measured both project statuses at 10px at 1280px. Status markup is `templates/index.html:17` and `:31` (rendered same lines). Raise status typography to at least 11–12px and reduce tracking if needed. The detector's 9px is responsive evidence, not the desktop measurement. |
| `overused-font` | `Primary font: arial` | False positive as a branding judgment. Current CSS declares bundled DM Sans as `DM`, Newsreader headings, and Arial as fallback (`style.css:1`). Browser computed styles report `DM, Arial, sans-serif` and `Newsreader, Georgia, serif`; screenshot shows the intended serif/sans relationship. No justification to replace the type system based on this warning. Actual glyph font attribution was not exposed; computed-family values alone cannot prove every glyph's font. |
| `skipped-heading` | `<h1> "Vid2Tab" followed by <h3> "Problem" (missing h2)` | Valid when the project disclosure opens. Verified browser outline: H1 Vid2Tab → H3 Problem/How it works/Demo/Tech → H2 TeachLA. Source `templates/index.html:17,22–25`; rendered same lines. Use a coherent page/project outline while retaining visible labels. |

## Browser method and limitations

After Assessment A released the shared browser, B created its own fresh temporary IAB tab, initially hidden, at the live URL. Desktop viewport measured **1280×720**, document width **1280**, no horizontal overflow. B did not change browser viewport or visibility, and did not inspect a mobile rendering. Responsive comments are source-based, not a claim of mobile browser verification.

The documented Playwright evaluate surface is **read-only**. Mutable title/script injection was therefore unavailable by API contract and was not attempted. **No reliable user-visible overlay exists.** No `[Human]` overlay tab was presented and no detector live server was started. Fallback evidence: CLI detector, screenshots, accessibility snapshots, read-only geometry/computed-style/DOM inspection, and ordinary UI clicks. Console warn/error inspection returned `[]`; no injected detector console findings are claimed.

The independent tab was closed after inspection and the required CUA completion summary was issued. No temporary files or local servers were created by B. `.impeccable/critique/ignore.md` was absent. `impeccable context --target templates/index.html` succeeded through `sh`; its `hasVisualImplementation:false` describes template resolution, not an absence of the plainly visible rendered site. No DESIGN.md was supplied.

## Browser findings

**[P2] Availability text is too small.** Both project status labels render at 10px desktop; source shrinks them further to 9px below 800px. These labels carry the useful distinction between completed and in-progress work. The tracked uppercase treatment makes scanning harder than the neighboring 12–17px content. Preserve the factual wording and make it comfortably legible. Suggested command: `$impeccable typeset`.

**[P2] Pause substitutes the initial poster for the paused frame.** Play loaded the real MP4 successfully (`readyState:4`, `paused:false`); Pause then yielded `videoHidden:true`, `posterHidden:false` at video time approximately 8.466s. A visitor pausing to inspect the app loses the very frame they chose. `outputs/portfolio-preview/project-media.js:18–25` hides video whenever playback is stopped. Retain the current video frame on pause; reserve poster replacement for initial/unloaded state. Suggested command: `$impeccable polish`.

**[P2] Media toggle semantics disagree with playback.** Stopped controls are exposed by native accessibility as checked controls labeled “Play”; after playing Vid2Tab the control becomes unchecked and labeled “Pause.” This comes from `aria-pressed=String(!playing)` in `project-media.js:19` and the equivalent paused-state mapping in `portfolio.js:23`. Use a simple action button with changing Play/Pause name and no pressed state, or a consistently named toggle with pressed mapped to the actual feature state. Suggested command: `$impeccable harden`.

**[P2] Expanded project notes skip a heading level.** Opening Vid2Tab details confirmed the detector's H1→H3 jump in the accessibility tree. The disclosure itself worked and correctly updated `aria-expanded` and its “Close details” label. Repair document hierarchy while preserving the typography and factual text. Suggested command: `$impeccable audit`.

**[P3] Active navigation can be stale after returning home.** Reproduction: click About; click the Kevin Co wordmark. URL becomes `#projects`, but DOM still has About active and Projects inactive. `portfolio.js:27` updates state only for `nav a`; the wordmark is outside that selector. Navigation also has no `aria-current`. Synchronize active state with the current hash/section, including wordmark and history changes. Suggested command: `$impeccable harden`.

**[P3] Press feedback is absent.** Project actions and media buttons have hover styling but no `:active` press treatment in the reviewed stylesheet. This is small craft debt rather than a reason to add decorative motion. Suggested command: `$impeccable polish`.

## Emil interaction review

These are proposed changes, not implementation claims.

| Before | After | Why |
| --- | --- | --- |
| Pause hides the video and restores the opening poster (`project-media.js:18–25`). | Leave the paused video frame visible; use poster only before first playback or after an explicit reset. | Pause should preserve the visitor's chosen inspection moment. |
| Play/Pause is simultaneously a changing action name and an inverted pressed toggle (`project-media.js:19–21`, `portfolio.js:23`). | Use a changing-name action button without `aria-pressed`, or a stable toggle name whose pressed state matches playing. | Keep state and action intelligible to assistive technology. |
| Action/media buttons have hover background changes but no explicit pressed treatment (`style.css:1,141–142`). | Give pointer presses restrained immediate feedback, such as a subtle 0.97 scale; remove movement under reduced motion and avoid delaying keyboard activation. | Confirmation should feel immediate and remain quiet. |
| About remains visually active after wordmark navigation returns to projects (`portfolio.js:27`). | Derive active and accessible-current state from navigation/hash changes as well as clicks. | The interface should reflect where the visitor is, regardless of the route taken. |

Positive interaction evidence: demos start paused; the real recording is loaded after Play; playback succeeded; disclosure state/name changes work; focus-visible outlines exist; media button geometry is 88×44px; real media pauses offscreen/on page visibility changes; reduced-motion changes pause playback; CSS transitions name properties rather than using `transition:all`. There is no evidence supporting a sweeping animation redesign.

## Composition evidence for synthesis

The first project begins at y≈203px on the 1280×720 desktop screenshot. Vid2Tab title, clear one-sentence description, technology line, GitHub and details controls are visible together; this meets projects-first intent. The first preview occupies x60–634px, y203–651px including caption. Its inset recording area is approximately 526×329px, with a dedicated bottom control band. The second project begins around y716px, just beyond the first viewport. There is no oversized promotional hero.

The serif masthead, thin ink rules, muted periwinkle/yellow/sage panels, original small square mark, and compact outlined actions form a coherent publication vocabulary compatible with the user's direction. Preserve it. The first poster is genuine product UI; TeachLA's caption clearly identifies its animation as illustrative. A source-level “coming soon” heading is paired with “Browse puzzles”; this is a potentially mixed availability signal, but B did not open the collection and does not infer whether it is empty or usable.

Questions skipped: Assessment B is an independent evidence contribution; the parent synthesis owns the user-facing questions.
