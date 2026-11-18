# Portfolio refinement Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax for tracking.
**Goal:** Apply the approved reassessment while preserving the NYT Games identity.
**Architecture:** Existing templates/JSON/static build remain. Project headings precede media semantically; CSS places them beside media on desktop. Media frame and caption/control footer are separate. Real playback retains its last video frame after Pause; GIF fallback uses the still when stopped.
**Tech Stack:** HTML, CSS, JavaScript, Node and Playwright.
**Spec:** docs/research/2026-11-18-portfolio-reassessment.md; user approved building the recommendations. Default choices: slim warm-paper Vid2Tab frame and existing genuine before/after still; no generated or altered evidence.
## Global Constraints
Retain serif/rules/puzzle mark, faithful media, optional playback, CMS fields, crossword behavior. No publish. Preserve research artifacts. Current catalog is empty; invitation will truthfully describe future collection.
## Review Focus
Pause and resume preserve time; rapid play/cancel has no stale state; GIF failure is controllable; title-before-image at mobile; keyboard/history navigation matches active section; native no-JS detail access; reduced-motion stops and keeps current frame.
### Task 1: Behavior and composition
Files: templates/index.html; outputs/portfolio-preview/{portfolio.js,project-media.js,style.css}; content/{site,vid2tab}.json; work/browser-tests/{presentation,vid2tab,refinement}.spec.cjs.
Interfaces: project article contains .project-heading, .project-preview, .project-copy, .project-details. Figure owns data-project-media or data-demo; .media contains stage only; figcaption contains label and .media-controls. Buttons change action name and data-paused, without aria-pressed. Navigation derives active/aria-current from hash.
- [x] Add browser tests for pause frame/time, plain button role, mobile semantic/visual ordering, heading outline, navigation click/hash/history, visible failed-media status. Observe failures.
- [x] Implement approved refinements; verify local access and empty catalog before wording changes.
- [x] Update obsolete poster/frame expectations, run full Node/browser suite and build.
- [x] Inspect rendered desktop/mobile, run Impeccable detector once, review changes and commit locally.

## Completion evidence
Full Node suite: 53 passed. Full Playwright suite: 29 passed, including delayed loading with final Play/Pause choice. Static build passed; git diff --check clean. Independent code review found no blocking issues. Desktop/mobile inspected in browser. Detector small-status and heading warnings resolved; only existing false-positive Arial warning remains. Preview retained at http://127.0.0.1:4318/. No publishing.
