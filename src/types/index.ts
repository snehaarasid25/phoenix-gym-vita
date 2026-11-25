/**
 * Shared content types.
 *
 * `verified` flags exist so that nothing unconfirmed is ever silently presented
 * as fact. In development, unverified items show a small "Placeholder" badge.
 */

export interface ImageAsset {
  /** Full URL or a path under /public (e.g. "/images/gym-floor.jpg"). */
  src: string
  alt: string
  /** Intrinsic aspect ratio (width / height) used to reserve layout space. */
  ratio?: number
  /** Optional CSS object-position, e.g. "50% 30%". */
  position?: string
  /** Credit for third-party placeholder photos. Remove when replaced. */
  credit?: string
}

export interface NavItem {
  label: string
  href: string
}

export interface Facility {
  id: string
  title: string
  description: string
  image: ImageAsset
  /** "confirmed" = verified with the owner / visible in official content. */
  status: 'confirmed' | 'proposed'
  /** Bento grid footprint on desktop. */
  size?: 'large' | 'tall' | 'wide' | 'regular'
}

export interface Program {
  id: string
  index: string
  title: string
  tagline: string
  description: string
  focus: string[]
  image: ImageAsset
  verified: boolean
}

export interface Pillar {
  title: string
  description: string
}

export interface MembershipPlan {
  id: string
  name: string
  duration: string
  /** Price in INR. `null` renders as "Price on enquiry". */
  price: number | null
  /** e.g. "/ month". Only shown when price is set. */
  priceNote?: string
  benefits: string[]
  highlight?: boolean
  highlightLabel?: string
  verified: boolean
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  detail: string
  /** Optional profile photo path under /public (square, e.g. 320px). Falls back to the initial. */
  photo?: string
  /** Sample testimonials are only rendered in development. */
  isSample: boolean
}

export interface GalleryImage extends ImageAsset {
  id: string
  category: 'Interior' | 'Equipment' | 'Training' | 'Lifestyle'
}

export interface InstagramPost {
  id: string
  url: string
  type: 'reel' | 'post'
  /** Short label used for the loading/fallback card and accessible names. */
  caption: string
}

export interface OpeningHours {
  days: string
  hours: string
}
