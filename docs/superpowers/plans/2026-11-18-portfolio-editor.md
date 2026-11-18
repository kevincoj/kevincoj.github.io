# Portfolio Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Kevin edit portfolio text in Pages CMS and publish on GitHub Pages.
**Architecture:** JSON content and HTML templates generate the existing static pages at build time. Pages CMS edits the JSON; GitHub Actions validates and publishes dist.
**Tech Stack:** Node.js, HTML/CSS/JS, JSON, Pages CMS, GitHub Actions/Pages.
**Spec:** docs/superpowers/specs/2026-11-18-portfolio-editor-design.md

## Global Constraints
Preserve existing design/media and an empty crossword catalog. Use plain text escaped into HTML. Publish only dist. Keep secrets out of GitHub and no visitor login. CMS authorization is Kevin's one-time account step.

## Review Focus
- Quotes/HTML pasted into fields must display as text.
- Missing or invalid fields must fail before publishing.
- CMS crossword wording must survive catalog initialization.
- Project title edits must not change stable IDs or navigation.
- Deployment must test the generated pages and retain the previous site after failure.

### Task 1: Content rendering and editor schema
**Files:** content/{site,vid2tab,teachla}.json; templates/{index,crosswords}.html; scripts/{render-content,build-portfolio}.mjs; .pages.yml; work/crossword-qa/content.test.cjs; outputs/portfolio-preview/crossword.js.
**Interfaces:** renderTemplate(template, content) -> HTML; buildContent() reads JSON, validates fields, renders static HTML into existing preview folder. Existing runtime uses rendered crossword data attributes.
- [ ] Write failing tests for escaping, changed copy/tags, missing fields, stable media markup, and crossword dataset rendering; run node --test work/crossword-qa/content.test.cjs and observe failure.
- [ ] Extract current copy without changing it; build validated escaped templates, preserve stable IDs/media. Configure labeled CMS forms and merge semantics.
- [ ] Make build/serve/browser-test flows generate content first; run tests, build, and existing browser suite against generated pages. Expect all pass.
- [ ] Commit content editor implementation.

### Task 2: Publishing and owner handoff
**Files:** .github/workflows/pages.yml; README.md; docs/editing.md; docs/deployment.md.
**Interfaces:** npm run build -> dist; workflow tests/builds then uploads only dist to Pages.
- [ ] Add Actions workflow with contents:read, pages:write, id-token:write, production concurrency, default branch deployment, Node 22, existing tests and static build. Keep browser checks before deployment.
- [ ] Review source/archive exclusions and secret history. Create kevincoj/kevincoj.github.io only if still absent; push exact reviewed source to main and enable workflow Pages publishing.
- [ ] Observe workflow success; check public homepage/crosswords and real assets, and explain editor authorization/Save workflow. Keep Sites URL available.
- [ ] Commit publishing docs, obtain fresh whole-change review, fix material findings, and publish validated final source.
