/**
 * Smooth scrolling with Lenis.
 * Runs unless the user prefers reduced motion (guarded by the caller).
 * Touch scrolling stays native (Lenis only smooths the wheel) so mobile feels
 * normal. If GSAP/ScrollTrigger is present, Lenis drives its updates so
 * pinned/scrub animations stay in sync.
 */
import Lenis from 'lenis';

export function initSmoothScroll(): void {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Leave touch scrolling native — smoothing it tends to feel laggy.
    syncTouch: false,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Smoothly scroll to in-page anchors (e.g. the hero "Scroll" cue -> #featured).
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    });
  });

  // Expose for ScrollTrigger integration (see project page animations).
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
}
