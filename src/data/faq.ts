import { cta, site } from '../config/site'

/**
 * Frequently asked questions, written for real local searches
 * ("gym in Vita", "HYROX Vita", "gym with steam bath near me"…).
 *
 * ✅ Every answer is built ONLY from verified facts in config/site.ts, so the
 *    visible text and the FAQPage structured data always match and update
 *    automatically when the owner fills in hours, prices, etc.
 * Keep answers short, factual and free of guarantees.
 */
export interface FaqItem {
  q: string
  a: string
}

const { location, contact, social } = site
const address = [location.streetAddress, `${location.city}, ${location.state} ${location.postalCode ?? ''}`.trim()].filter(Boolean).join(', ')
const reachUs = [
  contact.whatsapp && `WhatsApp or call us on ${contact.phoneDisplay ?? contact.phone}`,
  `message us on Instagram (@${social.instagramHandle})`,
]
  .filter(Boolean)
  .join(', or ')

const hoursAnswer = site.hours
  ? `Phoenix Gym is open ${site.hours.map((h) => `${h.days}: ${h.hours}`).join('; ')}.`
  : `Opening hours will be announced before launch. For the latest timings, ${reachUs}.`

export const faqs: FaqItem[] = [
  {
    q: `Where is Phoenix Gym in ${location.city}?`,
    a: `Phoenix Gym is at ${address}, in ${location.district} district. Use the "Get directions" button on this page to open the exact location in Google Maps.`,
  },
  {
    q: `What facilities does Phoenix Gym ${location.city} have?`,
    a: `Phoenix Gym offers HYROX training, a steam bath for recovery, a dedicated meditation and yoga area, and separate male and female changing rooms, with extra batches for families.`,
  },
  {
    q: `Is there HYROX training in ${location.city}?`,
    a: `Yes. Phoenix Gym offers HYROX training in ${location.city}. HYROX is a global fitness race that combines running with functional workout stations such as sled push and pull, rowing and wall balls.`,
  },
  {
    q: 'Does Phoenix Gym have a steam bath?',
    a: `Yes. Phoenix Gym has a steam bath on site, so you can recover after training without leaving the gym.`,
  },
  {
    q: 'Is Phoenix Gym suitable for women and families?',
    a: `Yes. Phoenix Gym has separate changing rooms for men and women, and runs extra family batches so family members can train together.`,
  },
  {
    q: 'Do you have yoga or meditation classes?',
    a: `Phoenix Gym has a dedicated meditation and yoga area for mobility, breathwork and recovery alongside strength training. Ask us for the current schedule.`,
  },
  {
    q: 'What are the gym timings?',
    a: hoursAnswer,
  },
  {
    q: 'How much does a gym membership cost at Phoenix Gym?',
    a: `Membership plans and pricing are being finalised for launch. ${cta.status}. For current rates and any opening offers, ${reachUs}.`,
  },
  {
    q: 'How do I join Phoenix Gym?',
    a: `${cta.status}. To reserve your spot or ask anything, ${reachUs}. You can also use the enquiry form on this page.`,
  },
]
