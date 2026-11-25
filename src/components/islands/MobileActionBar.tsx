import { AnimatePresence, motion } from 'motion/react'
import { InstagramLogo, Phone, WhatsappLogo } from '@phosphor-icons/react'
import { cta } from '../../config/site'
import { useScrolled } from '../../hooks/useScrolled'
import { primaryEnquiry, telLink } from '../../utils/contact'

/**
 * Thumb-zone conversion bar for phones. Most visitors arrive from Instagram
 * on mobile, so the enquiry action is always one tap away after the hero.
 */
/** Thumb-zone conversion bar (React island, hydrated when idle). */
export default function MobileActionBar() {
  const visible = useScrolled(600)
  const enquiry = primaryEnquiry()
  const tel = telLink()
  const Icon = enquiry.channel === 'whatsapp' ? WhatsappLogo : InstagramLogo

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:hidden"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
        >
          <div className="glass flex items-center gap-2 rounded-full p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] theme-light:shadow-[0_16px_40px_-12px_rgba(70,45,20,0.35)]">
            {tel && (
              <a href={tel} aria-label="Call Phoenix Gym" className="grid size-12 shrink-0 place-items-center rounded-full border border-bone/15 text-bone">
                <Phone className="size-5" weight="duotone" />
              </a>
            )}
            <a href={enquiry.href} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-bone/15 font-mono text-[0.68rem] font-semibold tracking-[0.14em] text-bone uppercase">
              <Icon className="size-4" /> {enquiry.channel === 'whatsapp' ? 'WhatsApp' : 'Message'}
            </a>
            <a href="/contact#enquire" data-enquire="" className="btn-primary flex h-12 flex-1 items-center justify-center rounded-full font-mono text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
              {cta.short}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
