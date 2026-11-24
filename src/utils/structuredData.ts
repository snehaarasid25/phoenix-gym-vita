import { absoluteUrl, ogImage } from '../config/seo'
import { site } from '../config/site'
import { faqs } from '../data/faq'

/**
 * Schema.org JSON-LD for local SEO. Only VERIFIED fields are emitted —
 * unknown values (phone, street address, hours, geo) are omitted rather than
 * guessed, and appear automatically once filled in `config/site.ts`.
 */
export function localBusinessSchema() {
  const { location, contact, social, hours } = site

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ExerciseGym',
    '@id': `${site.url}/#gym`,
    name: site.legalName,
    alternateName: site.name,
    slogan: site.brandLine,
    description: `${site.name} is a premium gym and fitness centre in ${location.city}, ${location.district} district, ${location.state}, with HYROX training, a steam bath, a meditation & yoga area and family batches.`,
    amenityFeature: ['Steam bath', 'HYROX training', 'Meditation & yoga area', 'Male & female changing rooms', 'Family batches'].map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    url: site.url,
    image: absoluteUrl(ogImage),
    logo: absoluteUrl('/brand/phoenix-emblem.png'),
    hasMap: location.mapsUrl,
    sameAs: [social.instagramUrl, social.facebookUrl, social.youtubeUrl],
    areaServed: [location.city, `${location.district} district`],
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: location.state,
      addressCountry: location.country,
      ...(location.streetAddress && { streetAddress: location.streetAddress }),
      ...(location.postalCode && { postalCode: location.postalCode }),
    },
  }

  if (contact.phone) schema.telephone = contact.phone
  if (contact.email) schema.email = contact.email
  if (location.geo) schema.geo = { '@type': 'GeoCoordinates', latitude: location.geo.lat, longitude: location.geo.lng }
  if (site.foundingYear) schema.foundingDate = String(site.foundingYear)
  // Free-text hours are surfaced in the UI; convert to OpeningHoursSpecification once finalised.
  if (hours) schema.openingHours = hours.map((h) => `${h.days} ${h.hours}`)

  return schema
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: `${site.name} ${site.location.city}`,
    inLanguage: 'en-IN',
  }
}

/** FAQPage schema built from the SAME data as the visible FAQ section. */
export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}
