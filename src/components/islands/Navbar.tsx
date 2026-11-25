import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { InstagramLogo, X } from '@phosphor-icons/react'
import { cta, navHref, navItems, site } from '../../config/site'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useScrolled } from '../../hooks/useScrolled'
import { cn } from '../../utils/cn'
import { ButtonLink } from '../ui/Button'
import { Logo } from '../ui/Logo'
import { ThemeToggle } from '../ui/ThemeToggle'

// Home-page sections the scroll-spy watches (page links like /about are matched by pathname instead)
const sectionIds = navItems.filter((n) => n.href.startsWith('#')).map((n) => n.href.slice(1))

/** True while the (always-dark) hero is still underneath the floating nav. */
function useOverHero(enabled: boolean) {
  const [over, setOver] = useState(true)
  useEffect(() => {
    if (!enabled) return
    const hero = document.getElementById('home')
    const update = () => setOver(!!hero && hero.getBoundingClientRect().bottom > 88)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled])
  return enabled && over
}

/**
 * Floating navigation (React island, hydrated on load).
 * `pathname` comes from Astro so the island needs no router.
 */
export default function Navbar({ pathname }: { pathname: string }) {
  const scrolled = useScrolled(40)
  const [open, setOpen] = useState(false)
  const onHome = pathname === '/'
  const overHero = useOverHero(onHome)
  const active = useActiveSection(onHome ? sectionIds : [])
  useLockBodyScroll(open)

  /** On sub-pages, home-section anchors must point back to the home page. */
  const resolve = (href: string) => navHref(href, onHome)
  const isActive = (href: string) => (href.startsWith('#') ? onHome && active === href.slice(1) : pathname === href)

  return (
    <>
      {/* Fixed geometry: only the surface fades in on scroll, nothing moves */}
      <header data-theme={overHero ? 'dark' : undefined} className="fixed inset-x-0 top-0 z-50 py-3 sm:py-4">
        {/* Page content fades out before it reaches the floating bar (no text sliding through the gap above it) */}
        <div
          aria-hidden
          // Shown via html[data-scrolled] (inline script, works before this island hydrates) OR this island's own state
          className={cn('nav-scrim pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+1.25rem)] bg-gradient-to-b from-ash-950 from-40% via-ash-950/80 to-transparent', scrolled && 'is-on')}
        />
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={cn(
              'flex items-center justify-between rounded-full border py-2 pr-2 pl-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[var(--ease-out-quint)] sm:pl-5',
              scrolled
                ? 'glass shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] theme-light:shadow-[0_18px_50px_-24px_rgba(70,45,20,0.35)]'
                : // Over the hero photo: a whisper of dark glass keeps links legible on bright skies
                  'border-bone/10 bg-ash-950/30 backdrop-blur-md',
            )}
          >
            <a href={onHome ? '#home' : '/'} aria-label={`${site.name} — home`} className="shrink-0">
              <Logo />
            </a>

            <ul className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const current = isActive(item.href)
                return (
                  // "Home" only from 1280px: on smaller laptops seven links don't fit (the logo links home there)
                  <li key={item.href} className={item.href === '#home' ? 'max-xl:hidden' : undefined}>
                    <a
                      href={resolve(item.href)}
                      aria-current={current ? (item.href.startsWith('#') ? 'true' : 'page') : undefined}
                      className={cn(
                        'relative rounded-full px-2.5 py-2 font-mono text-[0.7rem] font-medium tracking-[0.12em] uppercase transition-colors duration-300 xl:px-4 xl:tracking-[0.18em]',
                        current ? 'text-bone' : 'text-ash-300 hover:text-bone',
                      )}
                    >
                      {current && (
                        <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-bone/[0.07]" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                      )}
                      <span className="relative">{item.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="hidden sm:block">
                <ButtonLink href="/contact#enquire" data-enquire="">{cta.short}</ButtonLink>
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="grid size-12 place-items-center rounded-full border border-bone/15 bg-ash-950/40 backdrop-blur transition-colors hover:border-brand-400 lg:hidden"
              >
                <span className="flex w-5 flex-col items-end gap-[5px]" aria-hidden>
                  <span className="h-[2px] w-5 rounded bg-bone" />
                  <span className="h-[2px] w-3.5 rounded bg-brand-400" />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>{open && <MobileMenu onClose={() => setOpen(false)} resolve={resolve} />}</AnimatePresence>
    </>
  )
}

function MobileMenu({ onClose, resolve }: { onClose: () => void; resolve: (h: string) => string }) {
  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-[60] flex flex-col bg-ash-950 lg:hidden"
      initial={{ clipPath: 'circle(0% at calc(100% - 3rem) 3rem)' }}
      animate={{ clipPath: 'circle(150% at calc(100% - 3rem) 3rem)' }}
      exit={{ clipPath: 'circle(0% at calc(100% - 3rem) 3rem)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="glow-orb -right-48 -bottom-48 size-[40rem]" aria-hidden />
      <div className="glow-orb-soft -top-32 -left-32 size-[28rem]" aria-hidden />
      <div className="container-x flex items-center justify-between py-5">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          autoFocus
          className="grid size-12 place-items-center rounded-full border border-bone/15 transition-colors hover:border-brand-400"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center">
        <ul className="space-y-1">
          {navItems.map((item, i) => (
            <li key={item.href} className="overflow-hidden">
              <motion.a
                href={resolve(item.href)}
                onClick={onClose}
                className="group flex items-baseline gap-4 py-1"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="font-mono text-xs text-brand-400">0{i + 1}</span>
                <span className="font-display text-[3.4rem] leading-[0.95] text-bone transition-colors group-hover:text-brand-400 sm:text-7xl">{item.label}</span>
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>

      <motion.div
        className="container-x flex flex-col gap-4 border-t hairline py-6 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ButtonLink href="/contact#enquire" data-enquire="" onClick={onClose} size="lg" className="w-full sm:w-auto">
          {cta.long}
        </ButtonLink>
        <a href={site.social.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 font-mono text-xs tracking-[0.18em] text-ash-300 uppercase hover:text-bone">
          <InstagramLogo className="size-4" /> @{site.social.instagramHandle}
        </a>
      </motion.div>
    </motion.div>
  )
}
