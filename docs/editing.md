# Editing your portfolio

Live portfolio: https://kevincoj.github.io/
Source and publishing status: https://github.com/kevincoj/kevincoj.github.io
Browser editor: https://app.pagescms.org/

## One-time connection

1. Open the browser editor and sign in with GitHub as `kevincoj`.
2. Install/authorize the Pages CMS GitHub App. Choose **Only select repositories**, then `kevincoj.github.io`.
3. Open `kevincoj/kevincoj.github.io` and select the `main` branch. The editor reads the existing `.pages.yml` configuration; do not replace it with a starter config.

This is an editor account for Kevin. Visitors do not need accounts. Do not paste access tokens or passwords into chat or repository files.

## Changing wording

Choose **Homepage & crosswords**, **Vid2Tab text**, or **TeachLA text**. Change the labeled fields and click **Save**. Saving publishes through GitHub automatically after checks pass; there is no separate draft/visual-preview stage configured.

Open the repository's **Actions → Publish portfolio** to watch progress. Refresh the live site after the run succeeds. Updates normally take a few minutes; the Actions result is the source of truth.

Keep required fields filled. Text is treated as plain text, so type `&` normally and do not add HTML. In project names a new line becomes a visible line break. Technology tags are individual list items. Other paragraph line breaks display as ordinary spaces.

The crosswords introduction has separate fields for an empty collection and a collection with published puzzles. The current empty catalog displays “No crosswords yet.” Editing wording does not publish a puzzle.

## Undoing an edit

The easiest fix is to change the field back and Save again. Each save also creates a Git commit. For an older version, use the content file's GitHub history to recover its previous text, then save it in the editor. Failed validation or publishing keeps the previous successful site online; check the failed Actions step for the field name.

## What this editor controls

It changes wording and Vid2Tab technology tags. The layout, fonts, navigation, media assets, and project structure stay in the code. Adding a project, replacing a demo, or changing styling is a separate code change. The text editor does not add a visitor sign-in or another content database.

## Local development

- Edit `content/*.json` for wording.
- Edit `templates/*.html` for the two page layouts.
- Run `npm run serve` to render content and serve the local preview; rerun `npm run content` after a content change.
- `npm run build` renders content and copies only the website runtime to `dist`.
- `outputs/portfolio-preview/index.html` and `crosswords.html` are generated snapshots. Edit templates/content, not those generated HTML files.

CMS saves automatically update GitHub Pages. The older Sites-hosted URL remains a separate deployment and does not automatically receive CMS edits. Share the GitHub Pages URL going forward.
