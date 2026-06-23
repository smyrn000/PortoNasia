/**
 * Central site configuration.
 * Edit contact details, social links and navigation here in one place.
 * (Contact values below are placeholders — replace with the real ones.)
 */
export const site = {
  name: 'Nasia Kouklaki',
  role: 'Interior Architect',
  // Short tagline used in the hero and meta descriptions.
  tagline: 'Interior architecture with a sense of craft, light and togetherness.',
  description:
    'Portfolio of Nasia Kouklaki, interior architect — spatial design, communal living and material-led interiors that balance technical rigour with an artist’s eye.',
  // Used for absolute URLs (Open Graph). Keep in sync with astro.config.mjs `site`.
  url: 'https://nasiakouklaki.com',
  defaultOgImage: '/images/general/og-default.jpg',

  // ---- Contact (PLACEHOLDERS — replace before launch) -------------------
  contact: {
    email: 'hello@nasiakouklaki.com',
    phone: '+30 000 000 0000',
    location: 'Athens, Greece',
  },
  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Behance', href: 'https://behance.net/' },
  ],
} as const;

export const navLinks = [
  { label: 'Work', href: '/projects/' },
  { label: 'About', href: '/about/' },
  { label: 'Services', href: '/services/' },
  { label: 'Contact', href: '/contact/' },
] as const;
