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

export interface Program {
  id: string
  title: string
  tagline: string
  description: string
  focus: string[]
  /** Extra detail shown under "More": a short intro and a few titled points. */
  more?: { intro: string; points: { title: string; text: string }[] }
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
  /** Optional phrase inside the quote to pick out in gold (must match the quote text exactly). */
  highlight?: string
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
  /** Short line shown on the card (and its accessible name). */
  caption: string
  /** Cover image under /public (portrait 4:5). Optional: falls back to a branded card. */
  thumb?: string
}

export interface OpeningHours {
  days: string
  hours: string
}
