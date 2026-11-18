# Pastel frames and controls Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax for tracking.
**Goal:** Consistent pastel presentation and opt-in playback without changing the portfolio identity.
**Architecture:** Keep JSON/template rendering and the existing media scripts. A shared frame/stage/caption structure separates project imagery from site color and controls.
**Tech Stack:** HTML, CSS, JavaScript, Playwright, Node.
**Spec:** docs/superpowers/specs/2026-11-18-pastel-controls-design.md
## Global Constraints
Preserve latest CMS copy, real assets, static build, crossword behavior; no publishing.
## Review Focus
Explicit Play required after scrolling or restoring visibility; video failures keep controllable fallback; keyboard disclosure state; no-JS details; mobile overflow and larger lists.
### Task 1: Frames and controls
Files: templates/index.html; outputs/portfolio-preview/{style.css,portfolio.js,project-media.js}; content/vid2tab.json; work/browser-tests/{presentation,vid2tab}.spec.cjs.
Interface: data-project-media still controls real video; data-demo still controls illustrative canvas. Frame contains .preview-stage; matching .media-toggle-text reports state.
- [x] Add browser checks for initial paused/no network requests, explicit play/pause for both types, disclosure labels/aria, controls outside media, mobile and six varied fixture projects. Run and observe missing behavior.
- [x] Implement frames and controls; move existing availability wording to status without adding CMS schema.
- [x] Update old autoplay expectations to explicit-play behavior; run Node and browser suite and build.
- [x] Inspect rendered desktop/mobile screenshots, review diff, address defects, save local changes for review.
