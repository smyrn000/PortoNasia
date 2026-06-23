/**
 * Home hero: a calm staggered entrance for the headline + a gentle parallax
 * on the background image. No-ops under reduced motion.
 */
import { getGsap } from './gsap-core';

export function initHero(): void {
  const g = getGsap();
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  if (!g) return; // reduced motion: leave everything in its natural state
  const { gsap, ScrollTrigger } = g;

  const lines = hero.querySelectorAll<HTMLElement>('[data-hero-line]');

  gsap.set(lines, { y: 28, opacity: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  tl.to(lines, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09 });

  // Parallax the hero image only when the WebGL canvas is NOT taking over
  // (e.g. WebGL unsupported). When the canvas is active it owns the motion.
  const img = hero.querySelector<HTMLElement>('.hero__img');
  if (img && !hero.classList.contains('is-webgl')) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      animation: gsap.to(img, { yPercent: 12, ease: 'none' }),
    });
  }
}
