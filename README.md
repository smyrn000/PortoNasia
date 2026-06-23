# Nasia Kouklaki — Portfolio

A fast, image-led static portfolio for interior architect **Nasia Kouklaki**, built with [Astro](https://astro.build). Refined editorial design, content-driven projects, responsive imagery, SEO, accessibility and subtle GSAP animation.

---

## Quick start

```bash
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build to ./dist
npm run preview    # preview the production build locally
```

> **Note:** dependencies must be installed from your own machine (this project was assembled in an environment without npm registry access, so `node_modules/` is not included). Node 18+ is required; Node 20+ recommended.

---

## Tech stack

| Concern            | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Framework          | Astro 5 (static output)                             |
| Content            | MDX files + Astro content collections (typed schema)|
| Styling            | Hand-written CSS with design tokens (no framework)  |
| Simple motion      | CSS transitions + IntersectionObserver reveals      |
| Advanced motion    | GSAP + ScrollTrigger (hero entrance, parallax)      |
| 3D / WebGL         | Three.js (hero displacement + scroll-sequence shader)|
| Smooth scroll      | Lenis (optional, desktop only, off for reduced motion)|
| SEO                | `@astrojs/sitemap`, Open Graph, JSON-LD, robots.txt |
| Images             | Pre-optimised responsive JPG + WebP (two widths)    |

---

## Project structure

```
public/
  images/
    general/                     # hero, OG image, concept art
    projects/<slug>/gallery/     # optimised renders (jpg + webp + -thumb)
    projects/<slug>/plans/       # floor plans & drawings
  robots.txt
  favicon.svg

src/
  components/
    layout/    Layout, Header, Footer
    sections/  Hero, FeaturedProjects, ServicesPreview, AboutPreview
    projects/  ProjectCard, ProjectGrid, ProjectGallery, BeforeAfterSlider
    seo/       SEO (all <head> meta + JSON-LD)
    ui/        ResponsiveImage (<picture> with webp + srcset)
  content/
    projects/  *.mdx project files  (+ _template.mdx)
  content.config.ts               # the project content schema (zod)
  lib/
    site.ts                       # site name, contact, nav, socials
    services.ts                   # services + process copy
    images.ts                     # responsive-image helper
    image-dimensions.json         # intrinsic sizes (prevents layout shift)
  pages/
    index.astro                   # home
    about.astro  services.astro  contact.astro  404.astro
    projects/index.astro          # work index
    projects/[slug].astro         # generated project detail pages
  scripts/
    gallery.ts                    # accessible lightbox
    smoothScroll.ts               # Lenis bootstrap
    animations/                   # gsap-core, hero, projectHero, scrollReveal
  styles/
    variables.css  typography.css  global.css
```

---

## Adding a new project (no code required)

1. **Copy the template.** Duplicate `src/content/projects/_template.mdx` and rename it — the file name is the URL slug (`my-project.mdx` → `/projects/my-project/`).
2. **Add images.** Put optimised images in `public/images/projects/<slug>/`. See *Image preparation* below.
3. **Fill in the front-matter** (title, summary, location, year, category, cover, gallery, …) and write the story beneath the `---`.
4. Set `featured: true` to surface it on the home page, and `order:` to control its position (lower = earlier).
5. `draft: true` hides a project from the live site while you work on it.

That's it — no template or component changes needed.

### Required vs optional fields

**Required:** `title`, `summary`, `location`, `year`, `category`, `cover`.
**Optional:** `services`, `gallery`, `plans`, `concept`, `beforeAfter`, `testimonial`, `sequence`, `featured`, `order`, `draft`, `slug`, `seoTitle`, `seoDescription`.

#### `sequence` — the scroll-driven WebGL transition

A project can define a `sequence` of related frames that melt into one another via a displacement shader as the visitor scrolls through a pinned section (used on *Living Together* to move from drawing → empty space → lived-in):

```yaml
sequence:
  eyebrow: One corridor, three states
  intensity: 0.16          # displacement strength (subtle ~0.1–0.2)
  frames:                  # 2+ frames, each needs a caption
    - { src: /images/projects/<slug>/sequence/seq-1.jpg, alt: ..., caption: It begins as a drawing. }
    - { src: /images/projects/<slug>/sequence/seq-2.jpg, alt: ..., caption: Then it becomes space. }
    - { src: /images/projects/<slug>/sequence/seq-3.jpg, alt: ..., caption: Then it fills with life. }
```

Frames work best when they share roughly the same framing. Without WebGL or under reduced motion the section degrades to a clean, captioned stack of the same images.

Every image needs descriptive `alt` text — the schema enforces it.

---

## Image preparation

Images are served as pre-optimised responsive assets. For each source image, generate four files into the project's image folder so the `<ResponsiveImage>` component can build a `<picture>` with WebP + JPEG at two widths:

```
name.jpg          # large, ~1800px wide, quality ~82, progressive
name.webp         # same, WebP
name-thumb.jpg    # thumbnail, ~760px wide
name-thumb.webp   # thumbnail, WebP
```

Then record the **large** image's pixel dimensions in `src/lib/image-dimensions.json`:

```json
"/images/projects/my-project/gallery/name.jpg": { "w": 1800, "h": 1200 }
```

A reusable Python helper (`scripts/optimize-images.py`, requires Pillow) is the easiest way to batch this — see that file for the exact recipe used to build the current image set. After adding images, re-run it (or regenerate the dimensions JSON).

> Why pre-optimise instead of Astro's `<Image>`? It keeps the content model a simple set of public paths in MDX — friendly for non-developers and a clean path to a future CMS — while still shipping modern formats, correct dimensions and lazy loading.

---

## Editing site-wide details

- **Contact details, name, tagline, social links:** `src/lib/site.ts` *(contact values are currently placeholders — replace before launch).*
- **Services & process copy:** `src/lib/services.ts`
- **Colours, type scale, spacing:** `src/styles/variables.css`
- **Production domain:** set `SITE` in `astro.config.mjs` **and** the `url` in `src/lib/site.ts` (used for canonical URLs, the sitemap and Open Graph image URLs). Also update the `Sitemap:` line in `public/robots.txt`.

---

## Animation & accessibility

- Simple hover/reveal motion is pure CSS.
- GSAP handles the hero text entrance and gentle parallax.
- **Three.js / WebGL** powers two artistic moments, both kept deliberately subtle:
  - **Home hero** — the hero image is rendered on a plane with a soft, always-on displacement flow plus a ripple that follows the pointer. The `<img>` remains the LCP element and fallback; the canvas fades in only once ready.
  - **Living Together scroll sequence** — a displacement shader crossfades through `render_22 → render_23 → render_24` as you scroll a pinned section.
  - Three.js is dynamically imported, so its bundle only loads on pages that use it, and never under reduced motion or when WebGL is unavailable.
- **All motion respects `prefers-reduced-motion`** — reduced-motion visitors get the full content immediately with no transforms, no WebGL, and smooth scroll disabled.
- Semantic HTML, keyboard-accessible navigation and lightbox (native `<dialog>`), visible focus states, a skip link, and enforced image alt text throughout.

---

## Deployment

Static output — host anywhere. The repo works out of the box on **Vercel**, **Netlify** or **Cloudflare Pages**:

- Build command: `npm run build`
- Output directory: `dist`

No backend, database or environment variables are required.

---

## Future CMS migration

The content model lives entirely in typed MDX front-matter (`content.config.ts`). To move to Sanity, Decap or Contentful later, map those fields to the CMS schema and swap the content-collection loader — the page templates and components stay the same.
