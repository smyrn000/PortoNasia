/**
 * Shared GSAP + ScrollTrigger bootstrap.
 * Returns null when the user prefers reduced motion, so callers can skip all
 * advanced animation and leave the (already visible) static layout in place.
 * Also wires ScrollTrigger to Lenis when smooth scroll is active.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function getGsap() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;

    // Sync ScrollTrigger with Lenis if it is running.
    const lenis = (window as unknown as { __lenis?: { on: Function } }).__lenis;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }
  return { gsap, ScrollTrigger };
}
