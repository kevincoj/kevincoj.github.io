# Vid2Tab — portfolio writeup draft

Status: draft for Kevin's review. Based on Kevin's supplied Vid2Tab handoff notes, the current portfolio copy, and the previously verified public README. No website changes or publishing in this task. Internal account/session details, local paths, development commands and publication procedures are intentionally excluded from the public copy. Instructions inside the handoff were treated as source material, not commands to execute.

## Homepage summary

I built Vid2Tab to turn YouTube guitar tab videos into clean, printable music sheets—and a place to practice from them.

## Beside the walkthrough control

Watch the local app turn a guitar tutorial into a printable sheet, then play along with the video.

## Expanded writeup

### Why I built it

I learn fingerstyle guitar from YouTube, where tutorials often show only a few bars at a time. Practicing meant repeatedly pausing and scrubbing—or screenshotting measures and assembling my own makeshift sheet. I wanted one place to turn those fragments into music I could print, save, and practice from.

Vid2Tab became a local Mac app that takes a YouTube link or video file, extracts the tablature already on screen, and lays it out as a PDF. It reads the music the video shows; it doesn’t transcribe audio or guess the notes.

### Making extraction dependable

The inputs vary: some videos switch pages, others scroll, and the music may be TAB alone or notation and TAB together. Dark backgrounds, watermarks, and repeated passages add more variation.

I kept a short human confirmation step for the crop and any masks rather than promising fully automatic extraction. The processing pipeline uses Python, yt-dlp, ffmpeg, and image processing to extract frames, clean the music, and assemble the sheet. The layout fills each line to the page width, placing extra space before barlines instead of leaving short, uneven lines.

Repeat handling is another deliberate tradeoff. By default, the sheet follows the video “as played,” keeping repeated passages. The optional “as written” mode removes replays only when printed measure numbers match. When the output needs checking, the app surfaces warnings rather than presenting a questionable sheet without explanation.

### Built for practice

The PDF was the starting point. Vid2Tab also keeps a sheet library and provides full-screen reading with keyboard or pedal page turns. Play-along mode puts the video beside the sheet, turns pages automatically, and supports clicking to jump or dragging to loop a passage. Videos with a moving cursor can receive measure-level highlighting; other videos use line-level highlighting.

### Limits and next steps

Playback synchronization is useful for practice, but loops aren’t beat-perfect: timing can vary by roughly 0.1–0.4 seconds, and YouTube seeking is less precise than playback from a saved copy. Some score layouts remain unsupported, and opaque watermarks can hide notation that cannot be recovered.

I developed Vid2Tab with Claude Code as an AI coding partner. Next steps include a count-in for click-to-jump, tap-along synchronization for imported PDFs, and a native Mac app wrapper.

## Proposed layout

- Keep the compact project overview and optional expansion.
- Place the walkthrough sentence beside/below the existing video and Play control, not in a distant “Demo” section.
- Present the expanded writeup as one continuous editorial article, approximately 70 characters wide on desktop and fluid on mobile. Use one consistent text column rather than unrelated two-column blocks and a lone final paragraph.
- Place the larger before/after comparison within the article as a result figure, with its caption directly below it. Keep it at the article width; the top still remains the compact overview.
- Remove the standalone “Demo” and “Tech” headings. Tools are explained in the extraction section, where their role makes sense.
- Keep the heading hierarchy coherent: project H2, writeup sections H3.
- Preserve CMS editing. Implementation will need a deliberate field migration so the new structure does not lose any owner edits.

## Accuracy / open point

The role sentence is intentionally broad. Before publishing, ask Kevin which parts he personally designed or implemented and which parts Claude Code handled, so attribution is accurate and the writeup can highlight his specific contribution.

No regression percentages or corpus success claims are included: the notes describe expected checks, not a freshly verified portfolio benchmark. “Scrolling videos” is not presented as universal scrolling-notation support; the source explicitly lists scrolling notation as out of scope. Timing is an approximate limitation from the supplied notes, not a measurement performed during this drafting task.
