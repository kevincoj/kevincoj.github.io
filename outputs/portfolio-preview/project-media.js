// Real project recordings: load when visible, honour reduced motion, and keep controls usable.
(() => {
  document.querySelectorAll('[data-project-media]').forEach(panel => {
    const video = panel.querySelector('video');
    const poster = panel.querySelector('.project-poster');
    const button = panel.querySelector('.project-media-toggle');
    const label = button.querySelector('.media-toggle-text');
    const status = panel.querySelector('.media-status');
    const posterPath = poster.getAttribute('src');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let userPaused = false;
    let desiredPlaying = false;
    let generation = 0;
    let fallback = !video.canPlayType('video/mp4');
    video.muted = true;
    video.autoplay = !motion.matches;
    button.hidden = false;

    function render(playing) {
      button.setAttribute('aria-pressed', String(!playing));
      button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} Vid2Tab demo`);
      label.textContent = playing ? 'Pause' : 'Play';
      video.hidden = !playing || fallback;
      poster.hidden = playing && !fallback;
      const imagePath = playing && fallback ? video.dataset.fallbackSrc : posterPath;
      if (poster.getAttribute('src') !== imagePath) poster.src = imagePath;
    }
    function pause(manual = false) {
      generation++;
      desiredPlaying = false;
      if (manual) userPaused = true;
      video.pause();
      render(false);
    }
    async function play(manual = false) {
      if (!manual && (motion.matches || userPaused || document.hidden)) return;
      if (manual) userPaused = false;
      desiredPlaying = true;
      const request = ++generation;
      if (fallback) { render(true); return; }
      video.hidden = false;
      if (!video.getAttribute('src')) {
        video.src = video.dataset.src;
        video.load();
      }
      try {
        await video.play();
        if (request !== generation) { if (!desiredPlaying) video.pause(); return; }
        render(true);
        status.textContent = '';
      } catch {
        if (request !== generation || fallback) return;
        desiredPlaying = false;
        render(false);
        status.textContent = 'Press Play to watch the Vid2Tab demo.';
      }
    }
    button.addEventListener('click', () => desiredPlaying ? pause(true) : play(true));
    video.addEventListener('error', () => {
      fallback = true;
      video.pause();
      render(desiredPlaying);
      status.textContent = 'Video playback is unavailable. A GIF preview is available with the same Play and Pause controls.';
    });
    motion.addEventListener('change', () => {
      video.autoplay = !motion.matches;
      if (motion.matches) pause();
      else if (visible && !userPaused) play();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else if (visible && !userPaused) play();
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) play(); else pause();
      }, {threshold: .01});
      observer.observe(panel);
    } else {
      // Older browsers keep a user-initiated Play button instead of eagerly loading offscreen media.
      visible = true;
    }
    render(false);
  });
})();
