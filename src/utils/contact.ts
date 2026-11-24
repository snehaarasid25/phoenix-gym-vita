import { site } from '../config/site'

/** WhatsApp click-to-chat link, or `null` if no number is configured yet. */
export function whatsappLink(message = `Hi Phoenix Gym! I'd like to know more about membership.`) {
  const n = site.contact.whatsapp?.replace(/\D/g, '')
  if (!n) return null
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

export const telLink = () => (site.contact.phone ? `tel:${site.contact.phone.replace(/\s/g, '')}` : null)

/**
 * Best available direct-message channel. Falls back to Instagram DM
 * (verified handle) until a WhatsApp number is supplied.
 */
export function primaryEnquiry(message?: string) {
  const wa = whatsappLink(message)
  if (wa) return { href: wa, label: 'WhatsApp us', channel: 'whatsapp' as const }
  return { href: site.social.instagramDmUrl, label: 'Message on Instagram', channel: 'instagram' as const }
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
