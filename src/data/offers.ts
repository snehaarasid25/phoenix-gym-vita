/**
 * Occasion offers (e.g. "Diwali offer: 20% off Annual, 1–15 Nov"), owner-managed in /admin → Offers.
 * The build includes offers that haven't ended yet; the browser also checks the dates (scripts/site.ts),
 * so an offer appears on its start day and disappears after its end day even between rebuilds.
 */
import { remote } from './remote'

export interface Offer {
  id: string
  title: string
  description: string | null
  discountPercent: number | null
  planIds: string[] // empty = all plans
  startsOn: string // YYYY-MM-DD (inclusive)
  endsOn: string // YYYY-MM-DD (inclusive)
}

export const offers: Offer[] = (remote.offers ?? []).map((o) => ({
  id: o.id,
  title: o.title,
  description: o.description,
  discountPercent: o.discount_percent,
  planIds: o.plan_ids ?? [],
  startsOn: o.starts_on,
  endsOn: o.ends_on,
}))

/** The first offer that applies to a plan (if any). */
export const offerFor = (planId: string) => offers.find((o) => !o.planIds.length || o.planIds.includes(planId))

/** Whether an offer is live on a given day (local date, YYYY-MM-DD). */
export const isLive = (o: Pick<Offer, 'startsOn' | 'endsOn'>, today = new Date().toISOString().slice(0, 10)) =>
  today >= o.startsOn && today <= o.endsOn

export const fmtOfferDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
