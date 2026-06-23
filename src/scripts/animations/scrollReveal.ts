/**
 * Scroll reveal via IntersectionObserver.
 * Progressive enhancement: elements with [data-reveal] start hidden (CSS) and
 * get .is-visible when they enter the viewport. If reduced motion is requested
 * or IO is unavailable, everything is shown immediately.
 */
export function initReveal(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          // honour a per-element stagger index (--i) as a small delay
          const i = Number(getComputedStyle(el).getPropertyValue('--i')) || 0;
          el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`;
          el.classList.add('is-visible');
          obs.unobserve(el);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  els.forEach((el) => io.observe(el));

  // Failsafe: if anything goes wrong, reveal everything after a moment so the
  // page can never be left with invisible content.
  window.setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) =>
      el.classList.add('is-visible'),
    );
  }, 2600);
}
