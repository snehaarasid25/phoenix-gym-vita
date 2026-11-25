import { cta } from '../config/site'
import type { MembershipPlan } from '../types'
import { remote } from './remote'

/**
 * Membership plans.
 *
 * ⚠️ PRICES ARE NOT SET. `price: null` renders "Price on enquiry", which is a
 * perfectly valid production state if the gym prefers enquiries.
 * To publish prices: set `price: 1500`, `priceNote: '/ month'`, `verified: true`.
 *
 * Benefits are generic placeholders. Replace with what each plan actually includes.
 */
const builtInPlans: MembershipPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    duration: '1 Month',
    price: null,
    benefits: ['Full gym floor access', 'Strength & cardio zones', 'Orientation on first visit'],
    verified: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    duration: '3 Months',
    price: null,
    benefits: ['Everything in Monthly', 'Enough time to build a real habit', 'Progress check-ins'],
    verified: false,
  },
  {
    id: 'half-yearly',
    name: 'Half-Yearly',
    duration: '6 Months',
    price: null,
    benefits: ['Everything in Quarterly', 'Long-term programme guidance', 'Priority trainer support'],
    verified: false,
  },
  {
    id: 'annual',
    name: 'Annual',
    duration: '12 Months',
    price: null,
    benefits: ['Everything in Half-Yearly', 'A full year of training', 'Best for serious transformation'],
    highlight: true,
    highlightLabel: 'Full-year commitment',
    verified: false,
  },
]

/** Plans: owner-managed in /admin → Plans (Supabase), else the built-in list above. */
export const plans: MembershipPlan[] = remote.plans?.length
  ? remote.plans.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      price: p.price,
      priceNote: p.price_note ?? undefined,
      benefits: p.benefits,
      highlight: p.highlight,
      highlightLabel: p.highlight_label ?? undefined,
      verified: true,
    }))
  : builtInPlans

export const membershipNote = `${cta.status}. Plans and pricing are being finalised, so message us to register your interest and hear about opening offers first.`
