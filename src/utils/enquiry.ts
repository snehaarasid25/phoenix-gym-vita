/**
 * Tiny cross-island store for "what is the visitor enquiring about?".
 *
 * Plan / programme buttons and the contact form live in different islands
 * (or in plain HTML), so React context can't connect them. A window-level
 * value + event does: it also works if a button is clicked before the form
 * island has hydrated.
 */
const ENQUIRY_EVENT = 'phoenix:enquire'

declare global {
  interface Window {
    __phoenixEnquiry?: string
    __phoenixEnquiryOpen?: boolean
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

const OPEN_EVENT = 'phoenix:open-enquiry'

/**
 * Open the enquiry pop-up (components/islands/EnquiryModal.tsx), optionally pre-selecting an interest.
 * If the pop-up's island hasn't hydrated yet, the flag makes it open as soon as it does.
 */
export function requestEnquiry(interest = '') {
  if (interest) setEnquiry(interest)
  window.__phoenixEnquiryOpen = true
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}

export function onEnquiryRequest(open: () => void) {
  window.addEventListener(OPEN_EVENT, open)
  if (window.__phoenixEnquiryOpen) open()
  return () => window.removeEventListener(OPEN_EVENT, open)
}
