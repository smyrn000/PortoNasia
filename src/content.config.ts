import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project content model.
 *
 * Each project is a single .mdx file in src/content/projects/.
 * The file's name becomes its URL slug (e.g. living-together.mdx -> /projects/living-together/).
 * The MDX body is the project's "full description" / story — write it freely with
 * headings, paragraphs and the <Figure> component (auto-imported in project pages).
 *
 * Image fields are public paths beginning with /images/ — drop the matching
 * optimised files into /public/images/projects/<slug>/ and reference them here.
 */

const figure = z.object({
  src: z.string().startsWith('/images/'),
  alt: z.string().min(1, 'Every image needs descriptive alt text.'),
  caption: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** Optional explicit slug; defaults to the file name. */
    slug: z.string().optional(),
    /** Controls ordering on the index (lower = earlier). */
    order: z.number().default(100),

    summary: z.string(),            // short description (cards, meta)
    location: z.string(),
    year: z.coerce.number(),
    category: z.string(),
    services: z.array(z.string()).default([]),

    cover: figure,                  // hero / card image
    gallery: z.array(figure).default([]),

    // Optional sections
    beforeAfter: z
      .array(z.object({
        before: figure,
        after: figure,
        label: z.string().optional(),
      }))
      .optional(),
    plans: z.array(figure).optional(),       // floor plans / technical drawings
    concept: z.array(figure).optional(),     // concept / diagram images

    // Optional scroll-driven WebGL crossfade through related frames.
    sequence: z
      .object({
        eyebrow: z.string().optional(),
        intensity: z.number().optional(),
        frames: z
          .array(figure.extend({ caption: z.string() }))
          .min(2, 'A sequence needs at least two frames.'),
      })
      .optional(),
    testimonial: z
      .object({ quote: z.string(), author: z.string(), role: z.string().optional() })
      .optional(),

    featured: z.boolean().default(false),
    draft: z.boolean().default(false),

    // SEO overrides (fall back to title/summary when omitted)
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = { projects };
