import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Update this to the final production domain before deploying.
// Used for the sitemap, canonical URLs and absolute Open Graph image URLs.
const SITE = 'https://nasiakouklaki.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap()],
  build: {
    // Inline tiny stylesheets to reduce render-blocking requests.
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
