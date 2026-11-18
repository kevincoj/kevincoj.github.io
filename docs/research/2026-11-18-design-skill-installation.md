# Design skill installation and review scope

Date: November 18, 2026. User requested skill installation and a fresh joint reassessment, not another implementation pass.

## Verified installation

Installed using Codex's bundled skill-installer helper:

- Emil Kowalski: https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng → /Users/kevin/.codex/skills/emil-design-eng
- Taste Skill: https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill → /Users/kevin/.codex/skills/taste-skill (frontmatter name design-taste-frontend; version 2.5.1)
- unslop: https://github.com/heydamir/unslop/tree/main/skills/unslop → /Users/kevin/.codex/skills/unslop. By Damir Sokolovsky, CC BY 4.0; credit retained in installed source and references.
- Impeccable: existing local /Users/kevin/.codex/skills/impeccable, version 4.7.0. Not reinstalled over an existing skill. Context engine successfully invoked through `sh` because launcher lacks its executable bit. Engine reports 4.9.1 available; updating mid-review is excluded by its instructions.

Installer confirms new skills will enter automatic discovery on the next turn. This review explicitly reads the installed SKILL.md sources now, rather than waiting for automatic routing.

## How guidance is applied

The NYT Games-inspired personal identity, real project evidence, minimal copy, and project-first layout are user requirements. Skill prescriptions are subordinate to those requirements.

- Impeccable: preserve incumbent visual world, evaluate hierarchy and specificity, independent A visual review and B technical evidence with user permission.
- Emil: interaction coherence, responsive feedback, readable state changes, purposeful motion, accessibility. Review recommendations use Before/After/Why format.
- unslop: audit signs first, then preserve the existing brand in light-polish mode. No fabricated hero imagery, achievements or changed facts. Its maximum type-weight and one-accent defaults do not override the explicitly chosen bold editorial/pastel identity.
- Taste: read main skill and motion guidance; use concrete consistency/real-media/accessibility principles. Do not install its starter into the product, randomize the brand, anonymize real contact information, remove meaningful captions, or impose full-screen sections/effects on a compact portfolio. Those current house rules conflict with the user's brief.

## Actual automated Taste check

Ran `node /Users/kevin/.codex/skills/taste-skill/scripts/copy-lint.mjs outputs/portfolio-preview/index.html --kind software --json`.

It reported one `copy-residue` FAIL: the substring “as an AI” in “I used Claude Code as an AI pair-programmer.” This is a false positive on truthful user-approved attribution, not chatbot residue. No copy was changed to appease the linter. A full Taste build gate was not armed or claimed: this is a critique of an existing site, not a build using its starter system.

## Reviewed target

Local design branch `codex/pastel-portfolio-controls`, revision 8c00e56, source templates/index.html and rendered outputs/portfolio-preview/index.html at http://127.0.0.1:4318/. The public site is an earlier version and is not the current frame/control review target. No product-code changes are authorized by this research note.
