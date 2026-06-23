/**
 * Accessible lightbox for ProjectGallery.
 * Uses a native <dialog> (focus trapping + Esc handled by the platform) and
 * loads full-resolution images only when the viewer is opened.
 */
type Item = { src: string; webp: string; alt: string; caption: string };

export function initGallery(): void {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((root) => {
    const id = root.id;
    const dataEl = document.querySelector<HTMLScriptElement>(`[data-gallery-data="${id}"]`);
    const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
    if (!dataEl || !dialog || !('showModal' in dialog)) return;

    const items: Item[] = JSON.parse(dataEl.textContent || '[]');
    const imgEl = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
    const capEl = dialog.querySelector<HTMLElement>('[data-lightbox-cap]')!;
    let current = 0;
    let lastFocused: HTMLElement | null = null;

    const render = (i: number) => {
      current = (i + items.length) % items.length;
      const it = items[current];
      imgEl.src = it.src;
      imgEl.alt = it.alt;
      capEl.textContent = it.caption;
    };

    const open = (i: number, trigger: HTMLElement) => {
      lastFocused = trigger;
      render(i);
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    };
    const close = () => {
      dialog.close();
      document.documentElement.style.overflow = '';
      lastFocused?.focus();
    };

    root.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]').forEach((btn) => {
      btn.addEventListener('click', () =>
        open(Number(btn.dataset.lightboxOpen), btn),
      );
    });
    dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', close);
    dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => render(current - 1));
    dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => render(current + 1));

    // Close when clicking the backdrop area (outside the image)
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close();
    });
    dialog.addEventListener('cancel', () => {
      document.documentElement.style.overflow = '';
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') render(current - 1);
      if (e.key === 'ArrowRight') render(current + 1);
    });
  });
}
