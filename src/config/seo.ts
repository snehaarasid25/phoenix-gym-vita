import { site } from './site'

export interface PageMeta {
  path: string
  title: string
  description: string
  /** Exclude from search engines (e.g. legal pages until finalised). */
  noindex?: boolean
}

/**
 * Per-route metadata. The prerender script injects these into the static HTML
 * so search engines and social previews see them without running JavaScript.
 */
export const pages: Record<'home' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms', PageMeta> = {
  home: {
    path: '/',
    title: `${site.name} Vita | Premium Gym in Vita, Sangli: HYROX, Steam & Yoga`,
    description:
      'Phoenix Gym Vita (est. 2026) is a premium gym in Vita, Maharashtra, with strength training, HYROX training, a steam bath, a meditation & yoga area and family batches. Pre-booking starting soon.',
  },
  about: {
    path: '/about',
    title: `About ${site.name} Vita | Premium Gym in Vita, Sangli`,
    description: `The story behind ${site.name} Vita (est. ${site.foundingYear}): a premium gym in Vita built on strength, discipline and consistency.`,
  },
  contact: {
    path: '/contact',
    title: `Contact & Visit ${site.name} Vita | Nevari Road, Vita`,
    description: `Visit ${site.name} on Nevari Road, Vita, Maharashtra. Send an enquiry on WhatsApp, call us, get directions or follow @${site.social.instagramHandle} on Instagram.`,
  },
  faq: {
    path: '/faq',
    title: `FAQ | ${site.name} Vita: Timings, Membership, HYROX & Steam Bath`,
    description: `Answers to common questions about ${site.name} Vita: location, facilities, HYROX training, steam bath, yoga, timings, membership and how to join.`,
  },
  privacy: {
    path: '/privacy',
    title: `Privacy Policy | ${site.name} Vita`,
    description: `How ${site.name} Vita handles the information you share through this website.`,
  },
  terms: {
    path: '/terms',
    title: `Terms & Conditions | ${site.name} Vita`,
    description: `Terms and conditions for using the ${site.name} Vita website.`,
  },
}

export const ogImage = '/og-image.jpg'

export const absoluteUrl = (path: string) => new URL(path, site.url).toString()
