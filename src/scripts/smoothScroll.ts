/**
 * Optional smooth scrolling with Lenis, kept deliberately gentle.
 * Only runs when the user has NOT requested reduced motion (guarded by caller).
 * If GSAP/ScrollTrigger is present, Lenis drives its updates so pinned/scrub
 * animations stay in sync.
 */
import Lenis from 'lenis';

export function initSmoothScroll(): void {
  // Skip on touch devices where native momentum scrolling feels better.
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Expose for ScrollTrigger integration (see project page animations).
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
}
