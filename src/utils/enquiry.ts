/**
 * Tiny cross-island store for "what is the visitor enquiring about?".
 *
 * Plan / programme buttons and the contact form live in different islands
 * (or in plain HTML), so React context can't connect them. A window-level
 * value + event does: it also works if a button is clicked before the form
 * island has hydrated.
 */
export const ENQUIRY_EVENT = 'phoenix:enquire'

declare global {
  interface Window {
    __phoenixEnquiry?: string
  }
}

export const getEnquiry = () => (typeof window === 'undefined' ? '' : (window.__phoenixEnquiry ?? ''))

export function setEnquiry(interest: string) {
  window.__phoenixEnquiry = interest
  window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT, { detail: interest }))
}

export function subscribeEnquiry(callback: () => void) {
  window.addEventListener(ENQUIRY_EVENT, callback)
  return () => window.removeEventListener(ENQUIRY_EVENT, callback)
}

/** Pre-select an interest, scroll to the enquiry form and focus it. */
export function requestEnquiry(interest: string) {
  setEnquiry(interest)
  const target = document.getElementById('contact')
  const lenis = (window as Window & { __lenis?: { scrollTo: (el: Element, o?: object) => void } }).__lenis
  if (target && lenis) lenis.scrollTo(target, { offset: -80 })
  else target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.setTimeout(() => document.getElementById('enquiry-name')?.focus({ preventScroll: true }), 900)
}
