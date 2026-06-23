/**
 * Project detail page: parallax on the full-bleed hero image and a subtle
 * scale-in on figures tagged [data-parallax]. Reveals themselves are handled
 * by scrollReveal; this adds the more "advanced" scrubbed motion.
 */
import { getGsap } from './gsap-core';

export function initProjectHero(): void {
  const g = getGsap();
  if (!g) return;
  const { gsap } = g;

  const heroWrap = document.querySelector<HTMLElement>('[data-project-hero]');
  const heroImg = heroWrap?.querySelector<HTMLImageElement>('.project-hero__img img');
  if (heroWrap && heroImg) {
    gsap.fromTo(
      heroImg,
      { yPercent: 0 },
      {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: { trigger: heroWrap, start: 'top top', end: 'bottom top', scrub: true },
      },
    );
  }

  // Gentle parallax for marked feature images.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const img = el.querySelector('img');
    if (!img) return;
    gsap.fromTo(
      img,
      { yPercent: -6, scale: 1.12 },
      {
        yPercent: 6,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}
