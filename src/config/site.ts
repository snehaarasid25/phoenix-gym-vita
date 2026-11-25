import type { NavItem, OpeningHours } from '../types'
import { remote } from '../data/remote'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PHOENIX GYM — SINGLE SOURCE OF TRUTH FOR BUSINESS INFORMATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Edit this file to update contact details, hours and links across the site.
 *
 *  ✅ VERIFIED  — from official channels (Instagram bio, the "EST. 2026" launch
 *                 poster, Google Maps listing, Facebook, YouTube)
 *  ⚠️  TODO     — placeholder; must be confirmed with the gym owner before launch
 *
 *  Leave a value as `null` and the UI will hide it or show a graceful fallback
 *  instead of displaying made-up information.
 */

/**
 * Launch state drives every primary call-to-action label on the site.
 *  'prebooking-soon' → "Get Early Access"   (poster: "Pre-booking starting soon")
 *  'prebooking-open' → "Pre-book Now"
 *  'open'            → "Join Now"
 */
export type LaunchStatus = 'prebooking-soon' | 'prebooking-open' | 'open'

export const site = {
  // ✅ VERIFIED — Instagram display name / poster
  name: 'Phoenix Gym',
  legalName: 'Phoenix Gym Vita',
  shortName: 'Phoenix',

  // ✅ VERIFIED — Instagram bio lines
  tagline: 'Transform Your Body, Transform Your Life',
  values: ['Strength', 'Discipline', 'Consistency'] as const,
  journeyLine: 'Your Fitness Journey Starts Here',

  // ✅ VERIFIED — launch poster
  brandLine: 'Where Fitness Meets Refinement',
  brandCall: 'Secure Your Legacy',
  foundingYear: 2026 as number | null,
  /**
   * ✅ The gym's OWN advertised claim (launch poster). Superlatives should be
   * substantiable, so set to `null` to remove it everywhere if unsure.
   */
  claim: 'The biggest gym in Vita' as string | null,

  // Owner sets this in /admin → Settings (falls back to the value here)
  launchStatus: (remote.settings?.launch_status ?? 'prebooking-soon') as LaunchStatus,

  // ⚠️ TODO — production domain. Used for canonical URLs and OG tags.
  //    Keep in sync with SITE_URL in astro.config.mjs (sitemap + robots.txt).
  url: 'https://phoenixgymvita.netlify.app', // temporary Netlify address; switch to the real domain once bought

  location: {
    // ✅ VERIFIED
    city: 'Vita',
    district: 'Sangli',
    state: 'Maharashtra',
    country: 'IN',
    // ✅ VERIFIED — Google Maps listing address
    streetAddress: 'Sambhaji Nagar, Nevari Rd, Suyog Colony, Bhavaninagar' as string | null,
    postalCode: '415311' as string | null,
    // ✅ VERIFIED — official Google Maps listing
    mapsUrl:
      'https://www.google.com/maps/place/Phoenix+Gym/@17.2766465,74.5299646,17z/data=!3m1!4b1!4m6!3m5!1s0x3bc167005a9f2f55:0x2c3bf5ee18918284!8m2!3d17.2766465!4d74.5299646!16s%2Fg%2F11_03341tk',
    // ✅ VERIFIED — embed centred on the listing's exact pin
    mapEmbedUrl: 'https://maps.google.com/maps?q=Phoenix%20Gym%4017.2766465,74.5299646&z=17&output=embed' as string | null,
    // ✅ VERIFIED — coordinates from the Google Maps listing
    geo: { lat: 17.2766465, lng: 74.5299646 } as { lat: number; lng: number } | null,
  },

  contact: {
    // ✅ VERIFIED — supplied by the gym (E.164 format for links / structured data)
    phone: '+917757846875' as string | null,
    // How the number is shown on the page
    phoneDisplay: '+91 77578 46875' as string | null,
    // ✅ VERIFIED — same number is on WhatsApp (digits only, with country code)
    whatsapp: '917757846875' as string | null,
    // ⚠️ TODO — email (optional)
    email: null as string | null,
  },

  social: {
    // ✅ VERIFIED
    instagramHandle: 'phoenix_gym_03',
    instagramUrl: 'https://www.instagram.com/phoenix_gym_03/',
    instagramDmUrl: 'https://ig.me/m/phoenix_gym_03',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61595734381426',
    youtubeUrl: 'https://www.youtube.com/@Phoenixgym1',
    youtubeHandle: '@Phoenixgym1',
  },

  /**
   * Opening hours: owner sets them in /admin → Settings. `null`/empty shows "Hours to be announced".
   * Shape: [{ days: 'Mon – Sat', hours: '5:30 AM – 10:00 PM' }, { days: 'Sunday', hours: 'Closed' }]
   */
  hours: (remote.settings?.hours?.length ? remote.settings.hours : null) as OpeningHours[] | null,
} as const

/** Primary CTA wording for the current launch stage. */
export const cta = {
  'prebooking-soon': { short: 'Early Access', long: 'Get Early Access', status: 'Pre-booking starting soon' },
  'prebooking-open': { short: 'Pre-book', long: 'Pre-book Your Spot', status: 'Pre-booking now open' },
  open: { short: 'Join Now', long: 'Join Phoenix', status: 'Now open' },
}[site.launchStatus]

/** `#id` = a section on the home page; `/path` = its own page. */
export const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '/about' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Membership', href: '#membership' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

/** Resolve a nav href for the current page: home-page sections need a "/" prefix on other pages. */
export const navHref = (href: string, onHome: boolean) => (href.startsWith('#') && !onHome ? `/${href}` : href)

/** In development, unverified content shows a visible "Placeholder" badge. */
export const SHOW_PLACEHOLDER_BADGES = import.meta.env.DEV

/**
 * TEMPORARY (owner's request): show the sample reviews on the live site too, so the reviews row isn't a
 * single card. They stay clearly labelled "Sample — not real". Set to false once real reviews are in.
 */
export const SHOW_SAMPLE_REVIEWS_LIVE = true
