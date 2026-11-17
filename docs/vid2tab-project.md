# Vid2Tab portfolio feature

Replaces the old Tablature Stitcher entry and moves Vid2Tab first. The existing site has static HTML project rows and shared expand controls, with no project data file or reusable component; this feature follows that structure and preserves the current type, colour palette and spacing conventions.

User-confirmed positioning: local web UI, on-screen sheet playback and video play-along already work. Hosted product access is next. The GitHub URL is supplied; no live product URL is invented.

Media lives in `outputs/portfolio-preview/assets/projects/vid2tab/`: the supplied MP4 and GIF are copied unchanged, the poster is a JPEG extracted from the MP4's first frame, and the supplied before/after PNG supports the expanded Demo section. The MP4 is 1600×1000 at 30 fps. The video loads on visibility, pauses offscreen, and starts only after explicit Play for reduced-motion visitors. A GIF is requested only after unavailable/failed video playback, and Pause restores the still poster. Fixed media dimensions/aspect ratio prevent layout shift. The before/after image lazy-loads below the fold.

Details preserve the existing Explore project interaction and add Problem, How it works, Demo, Tech and What’s next. A site-level hosted preview does not imply the Vid2Tab processing app is publicly hosted.

Verification: 7 browser scenarios passed (featured content, reduced motion, below-fold lazy loading, playback controls/dynamic preference, fallback, mobile rendering/image decode, desktop aspect ratio), 47 existing Node tests passed, and the static build succeeded. Desktop/mobile captures were inspected. An independent static review found no material issues; Safari/iOS were not independently tested.
