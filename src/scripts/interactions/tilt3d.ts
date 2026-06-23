/**
 * Cursor-driven 3D tilt.
 *
 * Any element with [data-tilt] tilts in real 3D toward the pointer (CSS 3D
 * transforms — no WebGL required, so it works everywhere). The transform is
 * applied to [data-tilt-inner] if present, otherwise to the element itself.
 *
 * Pointer-driven by design: it only moves in response to the user, so it stays
 * on even when prefers-reduced-motion is set (no autonomous animation). It is
 * skipped on touch/coarse-pointer devices where there is no hover.
 *
 * Options via data-attributes:
 *   data-tilt-max="10"     max rotation in degrees (default 10)
 *   data-tilt-scale="1.03" hover scale (default 1.03)
 *   data-tilt-lift="8"     px lift on the Z/Y axis (default 6)
 *   data-tilt-glare        add a moving sheen highlight
 */
export function initTilt(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const inner = el.querySelector<HTMLElement>('[data-tilt-inner]') ?? el;
    const max = Number(el.dataset.tiltMax ?? 10);
    const scale = Number(el.dataset.tiltScale ?? 1.03);
    const lift = Number(el.dataset.tiltLift ?? 6);

    let rx = 0, ry = 0, s = 1, ty = 0;
    let trx = 0, tryy = 0, ts = 1, tty = 0;
    let raf = 0;

    inner.style.transformOrigin = 'center';
    inner.style.willChange = 'transform';
    inner.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';

    const tick = () => {
      rx += (trx - rx) * 0.16;
      ry += (tryy - ry) * 0.16;
      s += (ts - s) * 0.16;
      ty += (tty - ty) * 0.16;
      inner.style.transform =
        `perspective(1000px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) ` +
        `translateY(${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener('pointerenter', () => {
      inner.style.transition = 'none';
      if (!raf) raf = requestAnimationFrame(tick);
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tryy = px * max;
      trx = -py * max;
      ts = scale;
      tty = -lift;
    });
    el.addEventListener('pointerleave', () => {
      // Stop the follow loop and let CSS ease everything back to rest.
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      trx = tryy = rx = ry = tty = ty = 0; ts = s = 1;
      inner.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      inner.style.transform = '';
    });
  });
}
