# Independent Assessment A — 2026-11-18

Target: `templates/index.html`, rendered by `outputs/portfolio-preview/` at http://127.0.0.1:4318/. Mode: Experience. Assessor: `/root/design_reassessment_a`. Independent review, no detector findings or prior review consulted. Review only; no site edits.

## Design specificity verdict

This feels authored for Kevin's work: a personal newspaper masthead, strong Newsreader display type, crisp ink rules, quiet sans text, project-specific materials, and restrained periwinkle/yellow/sage panels. The Games influence is clear without reproducing NYT's branding. It is not a generic SaaS template. Its weakness is editorial selection: the frame is more immediately legible than the actual accomplishment inside the first screenshot. Refinement should preserve this identity.

Taste's full-screen sections, mandatory moments, no captions, ban on lavender, and one-column/full-width-button prescriptions are not acceptance criteria here. They conflict with the approved compact projects-first portfolio and palette. Unslop's prohibition on heavy headings similarly conflicts with the intentional publication typography. Keep the heavy serif, pastel frames, and the provenance caption on TeachLA; remove neither for checklist compliance. No photographic hero, generic slogan, extra promotional copy, or oversized introduction is needed.

## Strengths

1. **The work leads.** At desktop default viewport, a compact identity/contact strip gives way directly to Vid2Tab. There is no screen-consuming welcome hero. Two main projects and a smaller crossword strip create a clear collection.
2. **A coherent publication identity.** Masthead, black rules, large serif titles, thin outlined controls and flat pastel media panels feel related. Titles and project content carry the richness; chrome stays quiet.
3. **Honest, optional depth.** Vid2Tab uses real project media; TeachLA explicitly says “Illustrative preview.” Details expand in place and retain project context. Media begins paused; Play/Pause works and its label changes. This respects attention and the brief's minimal-copy preference.

## Priority issues

### 1. [P2] On mobile, the screenshot precedes the information needed to understand it

**Evidence:** In the fresh 390×844 override, masthead, navigation and introduction come first, then a large framed whole-app screenshot and “App walkthrough”; only afterward does the Vid2Tab title and its one-line purpose appear. The interface in the screenshot is scaled too small to explain itself. TeachLA repeats this visual-before-name sequence lower down.

**Why it matters:** A visitor sees an anonymous miniature application before learning what Kevin made. The image is visible immediately, but the work is slower to understand. This is especially costly for a quick phone scan.

**Concrete fix:** At the mobile breakpoint, put project title/status and the existing short purpose before the media, with details/GitHub following it. Split the project-copy into heading/summary and actions if needed; use semantic DOM order that also makes sense for assistive technology. Keep the desktop split. Do not add copy or a hero. Suggested command: `$impeccable adapt`.

### 2. [P2] The first still shows the library more clearly than the transformation

**Evidence:** Vid2Tab's initial poster is the whole local app, including many sheet thumbnails. At desktop its controls and small sheet content require close inspection; on mobile they are effectively miniature. The particularly convincing before/after evidence exists only inside Project details. The recording is reachable, but a scanner must choose Play or expand notes to see the main proof.

**Why it matters:** “Video to printable sheet” is the strongest fact and differentiates Kevin's project. Currently the visitor must read the sentence and imagine the transformation before the media proves it.

**Concrete fix:** Change only the opening still to a carefully composed crop of the real supplied before/after evidence, or a real frame showing source video and clean output together. Keep Play for the full walkthrough and preserve the existing pastel frame. Avoid drawing replacement fake UI or adding explanation paragraphs. Suggested command: `$impeccable polish`.

### 3. [P2] “Available for use” has an unclear next action

**Evidence:** Vid2Tab's visible status says “COMPLETED NOVEMBER 2026 · AVAILABLE FOR USE.” Adjacent choices are Project details and GitHub. The live surface provides no visible distinction between local/source access and a hosted application; the media itself shows a URL-entry app. PRODUCT.md says hosted access is next, but the source surface is the authority and no hosted CTA is present.

**Why it matters:** A visitor expecting to try the app may hunt for a missing launch action or mistake Play for trying the application. It weakens confidence at the point the project becomes interesting.

**Concrete fix:** If source/local installation is the intended access, use a precise short status such as “Local app · source available” and label the existing link “View source” (or keep GitHub if preferred). If the owner now has a public app URL, use that real destination and a clear “Try Vid2Tab” action. Verify current availability before changing factual copy; do not invent a deployment. Suggested command: `$impeccable clarify`.

### 4. [P2] The closing crossword strip promises two different states

**Evidence:** The sage band says “crosswords coming soon...” and “A future home for my crosswords,” alongside an active “Browse puzzles” link. The header also offers Crosswords. This review did not follow the collection/solver flow, so it does not claim the destination is broken.

**Why it matters:** The end of the page turns a confident portfolio into a provisional work-in-progress message. Visitors cannot tell whether there is anything to browse.

**Concrete fix:** Match copy and action to current inventory: if personal puzzles exist, use the simple heading “Crosswords” and the existing browse action; if the page is a solver/import tool, label that capability accurately; if it is only a future collection, show a quiet future note without a contradictory browse CTA. Preserve the secondary scale and sage identity. Suggested command: `$impeccable clarify`.

## Cognitive load

Low on desktop; moderate on the mobile entry. Eight-item checklist:

- Single focus: passes; project collection clearly leads.
- Chunking: partial failure; five visible technology labels compete as one group, though they are informational, not five actions. They can be reduced to the most informative three and the rest kept in details if the user wants a quieter face.
- Grouping: passes; projects are separated by rules, metadata and actions remain near their own work.
- Visual hierarchy: passes desktop, fails mobile sequencing as described in issue 1.
- One thing at a time: passes; paused media and optional detail disclosure avoid simultaneous demands.
- Minimal choices: passes. Header has three navigation options; contact group three links; each project's action group one or two buttons. There is no >4-option action decision. The five tech labels are the only >4-item visible informational group.
- Working memory: passes; opening details keeps the work in place and needs no remembered information from another page.
- Progressive disclosure: passes; explanatory paragraphs are optional.

Two partial/mobile failures = moderate by the rubric, with a low-load desktop index. Do not add filters, project tags as controls, more intro copy, or a case-study menu to solve these problems.

## Emotional journey

Entry feels calm, friendly and editorial. The first real product creates credibility. Peak potential is the before/after transformation and genuine motivation in Vid2Tab's details. The valley is effort spent interpreting tiny app material, followed by a weaker illustrative second project. The end is clear contact access, but the “coming soon” band leaves an unfinished last impression immediately before it. Reassurance is strongest in honest provenance labels; precise availability wording would sustain it. There is no high-stakes transaction in this homepage flow.

## Persona red flags

- **Jordan, first-time visitor:** the app looks usable but “Available for use” offers no explicit launch/local distinction. “Play” must remain clearly the demo, separate from trying the project.
- **Casey, distracted mobile visitor:** sees the tiny whole-app poster before its project name and purpose. Header/contact links and small metadata are substantially less comfortable than the large media Play target. Their exact hit-area and accessibility consequences need technical audit; not measured here.
- **Employer scanning Kevin's contributions:** Vid2Tab's personal build sentence is good. TeachLA's visible summary explains the product category rather than Kevin's particular contribution; its details add only brief context. Add one accurate role phrase only when confirmed, preferably replacing generic text rather than lengthening the page. Do not invent outcomes or implementation.

## Nielsen heuristic scores

| # | Heuristic | Score | Rationale |
|---|---|---:|---|
| 1 | Visibility of system status | 3/4 | Play/Pause and expanded details visibly update. Availability wording is ambiguous. |
| 2 | Match system / real world | 3/4 | Natural project language; use/browse claims need alignment with actual destinations. |
| 3 | User control and freedom | 3/4 | Inline details close easily, media pauses, simple navigation. No destructive flow here. |
| 4 | Consistency and standards | 3/4 | Cohesive project system. Tech labels look link-like despite being noninteractive; About is revealed differently from other navigation. |
| 5 | Error prevention | 3/4 | Paused default and illustration caption prevent important misconceptions; access wording can still mislead. |
| 6 | Recognition rather than recall | 3/4 | Labeled nav/actions and co-located details; mobile ordering delays project recognition. |
| 7 | Flexibility and efficiency | n/a | Experience index; accelerators, bulk controls and customization are unnecessary. |
| 8 | Aesthetic and minimalist design | 3/4 | Distinct, restrained world. First poster lacks a legible focal result; minor redundant intro/About text. |
| 9 | Error recovery | 2/4 | Source includes video/GIF fallback and retry label, but recovery status is visually hidden. Network/error branches were not simulated. |
| 10 | Help and documentation | n/a | Experience index needs understandable work and actions, not a help system. |
| **Total** | | **23/32 (71.9%) — Good** | Eight applicable heuristics; n/a: 7 and 10. |

Scores describe this homepage scope. They do not grade the crossword solver.

## Minor observations

- Introduction reads “Hi I'm Kevin Co I'm a CS student...” as a run-on. One punctuation change improves it without adding words: “I'm Kevin Co, a CS student at UCLA. These are my personal projects.” Preserve the user's voice and approve factual text only as needed.
- The tiny uppercase status is less readable than the rest of the hierarchy. Sentence case and one size step up could help; uppercase itself is not disallowed by this brief.
- Technology labels have individual underlines resembling links, although they are list items. A plain compact list or middle-dot-separated text would communicate metadata more accurately.
- About navigation reveals a section whose content largely repeats the introduction and contact links. Prefer one useful accurate personal detail if available; do not inflate it merely to justify the tab.
- Source includes generic video failure messages inside a visually-hidden status. If playback fails, show a compact visible retry/download option in the media panel as well as announcing it.

## Questions for synthesis

1. Should the first Vid2Tab frame prioritize the finished sheet transformation or the breadth of the local app?
2. Is Vid2Tab currently intended to be tried online, installed locally, or evaluated through source and recording?
3. Does Crosswords currently contain personal puzzles, or should its invitation describe the solver instead?

## Scope and limits

Inspected a new Chrome tab at default desktop size (screenshot 1680×831) and an explicit 390×844 mobile viewport override. Reviewed homepage lower content, Vid2Tab inline details, About reveal, and Vid2Tab Play/Pause. Reset viewport and returned tab to homepage. CUA completion summary sent. Existing server was not started or stopped by this assessor. No detector, prior findings, external link navigation, collection/solver audit, measured contrast, screen reader session, slow network/error simulation, or exhaustive keyboard/zoom testing. Source evidence from templates/index.html and outputs/portfolio-preview/style.css, portfolio.js, project-media.js; product context from PRODUCT.md. No site edits.
