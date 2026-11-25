import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { plans } from '../../data/membership'
import { facilities } from '../../data/facilities'
import { getEnquiry, setEnquiry, subscribeEnquiry } from '../../utils/enquiry'
import { primaryEnquiry } from '../../utils/contact'
import { saveEnquiry } from '../../utils/supabase'
import { Button } from '../ui/Button'
import { Select, type SelectGroup } from '../ui/Select'

const interestGroups: SelectGroup[] = [
  { label: 'Membership', options: plans.map((p) => `${p.name} membership`) },
  { label: 'Facilities & training', options: facilities.map((f) => f.title) },
  { label: 'Other', options: ['Just visiting / general question'] },
]
const knownOptions = interestGroups.flatMap((g) => g.options)

/**
 * Enquiry form (React island). Saves the enquiry to Supabase (when configured) and composes a WhatsApp
 * message (or copies text + opens an Instagram DM when no WhatsApp number is set).
 * WhatsApp always opens, even if saving fails, so no lead is lost.
 */
export default function EnquiryForm({ idPrefix = 'enquiry', autoFocus = false }: { idPrefix?: string; autoFocus?: boolean }) {
  const id = (name: string) => `${idPrefix}-${name}`
  // Shared with "Enquire" buttons elsewhere on the page (see utils/enquiry.ts)
  const interest = useSyncExternalStore(subscribeEnquiry, getEnquiry, () => '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [trap, setTrap] = useState('') // hidden honeypot: real visitors never fill it
  const [sent, setSent] = useState(false)

  const channel = primaryEnquiry().channel

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = [
      `Hi Phoenix Gym! 👋`,
      `Name: ${name}`,
      phone && `Phone: ${phone}`,
      interest && `Interested in: ${interest}`,
      message && `Message: ${message}`,
    ]
      .filter(Boolean)
      .join('\n')

    // Bots fill hidden fields: pretend success, save nothing
    if (trap) {
      setSent(true)
      return
    }
    // Fire-and-forget save (keepalive), then open WhatsApp straight away inside the click so it isn't blocked
    void saveEnquiry({ name, phone, interest: interest || null, message: message || null, consent: true })

    const target = primaryEnquiry(text)
    if (target.channel === 'instagram') {
      // Instagram DMs can't be pre-filled — copy the message so it can be pasted.
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        /* clipboard may be unavailable; the DM still opens */
      }
    }
    window.open(target.href, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  const field =
    'peer w-full rounded-xl border border-bone/12 bg-ash-950/60 px-4 pt-6 pb-2.5 text-base text-bone outline-none transition-colors placeholder:text-transparent focus:border-brand-400'
  const label =
    'pointer-events-none absolute top-2 left-4 font-mono text-[0.6rem] tracking-[0.16em] text-ash-400 uppercase transition-colors peer-focus:text-brand-300'

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col" aria-labelledby={id('heading')}>
      <h3 id={id('heading')} className="font-display text-4xl leading-none uppercase sm:text-5xl">Send an enquiry</h3>
      <p className="mt-3 max-w-md text-sm text-ash-400">
        {channel === 'whatsapp'
          ? 'Fill this in and we’ll open WhatsApp with your message ready to send.'
          : 'Fill this in and we’ll copy your message and open an Instagram DM. Just paste and send.'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <input id={id('name')} autoFocus={autoFocus} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
          <label htmlFor={id('name')} className={label}>Name *</label>
        </div>
        <div className="relative">
          <input id={id('phone')} required type="tel" inputMode="tel" autoComplete="tel" pattern="[0-9+\s\-]{7,15}" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={field} />
          <label htmlFor={id('phone')} className={label}>Phone *</label>
        </div>
        <div className="relative sm:col-span-2">
          <Select
            id={id('interest')}
            label="I'm interested in"
            placeholder="Choose one (optional)"
            value={interest}
            onChange={setEnquiry}
            // A value set by an "Enquire" button elsewhere that isn't in the list still shows as selected
            groups={interest && !knownOptions.includes(interest) ? [...interestGroups.slice(0, 2), { label: 'Other', options: [interest, ...interestGroups[2].options] }] : interestGroups}
            fieldClassName={field}
            labelClassName={label}
          />
        </div>
        <div className="relative sm:col-span-2">
          <textarea id={id('message')} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className={`${field} resize-none`} />
          <label htmlFor={id('message')} className={label}>Message</label>
        </div>
        {/* Honeypot (hidden from people and screen readers) */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
          <label htmlFor={id('website')}>Website</label>
          <input id={id('website')} tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ash-300 sm:col-span-2">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-brand-500)]"
          />
          <span>
            I agree to Phoenix Gym contacting me about my enquiry by phone or WhatsApp. See our{' '}
            <a href="/privacy" className="text-brand-300 underline underline-offset-2 hover:text-brand-200">
              Privacy Policy
            </a>
            .
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" icon={<PaperPlaneTilt className="size-4" weight="bold" />}>
          {channel === 'whatsapp' ? 'Send on WhatsApp' : 'Send via Instagram'}
        </Button>
        <p aria-live="polite" className="text-sm text-ash-400">
          {sent && (channel === 'instagram' ? 'Message copied. Paste it in the DM.' : 'Opening WhatsApp…')}
        </p>
      </div>
    </form>
  )
}
