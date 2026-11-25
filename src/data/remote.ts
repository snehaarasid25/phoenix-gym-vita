/**
 * Owner-edited content fetched from Supabase at build time (scripts/fetch-content.mjs → remote.json).
 * Every field is optional: when the snapshot is missing or empty, the site uses the built-in defaults.
 */
import type { OpeningHours } from '../types'

export interface RemoteSettings {
  launch_status: 'prebooking-soon' | 'prebooking-open' | 'open'
  hours: OpeningHours[] | null
}
export interface RemotePlan {
  id: string
  name: string
  duration: string
  price: number | null
  price_note: string | null
  benefits: string[]
  highlight: boolean
  highlight_label: string | null
}
export interface RemoteOffer {
  id: string
  title: string
  description: string | null
  discount_percent: number | null
  plan_ids: string[]
  starts_on: string
  ends_on: string
}
export interface RemoteReview {
  id: string
  name: string
  detail: string
  quote: string
  highlight: string | null
  photo_url: string | null
  is_sample: boolean
}
interface RemoteContent {
  settings?: RemoteSettings | null
  plans?: RemotePlan[]
  offers?: RemoteOffer[]
  reviews?: RemoteReview[]
}

// Optional file: absent in a fresh checkout until `npm run content` / `npm run build` creates it
const files = import.meta.glob<RemoteContent>('./remote.json', { eager: true, import: 'default' })
export const remote: RemoteContent = files['./remote.json'] ?? {}
