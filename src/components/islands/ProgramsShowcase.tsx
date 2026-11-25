import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, CaretDown } from '@phosphor-icons/react'
import { programs } from '../../data/programs'
import { requestEnquiry } from '../../utils/enquiry'
import { Button } from '../ui/Button'
import { Img } from '../ui/Img'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'
import { Reveal } from '../ui/Reveal'
import type { Program } from '../../types'
import { cn } from '../../utils/cn'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Programmes showcase (React island, hydrated when visible).
 * Desktop: hover/focus tab list + cinematic preview. Mobile: swipeable cards.
 */
export default function ProgramsShowcase() {
  return (
    <>
      <DesktopShowcase />
      <MobileCards />
    </>
  )
}

/* ── Desktop: interactive index list + cinematic preview panel ─────────────── */
function DesktopShowcase() {
  const [active, setActive] = useState(0)
  const p = programs[active]

  return (
    <div className="hidden gap-12 lg:grid lg:grid-cols-12">
      <ul className="lg:col-span-6" role="tablist" aria-label="Training programs" aria-orientation="vertical">
        {programs.map((prog, i) => {
          const isActive = i === active
          return (
            <li key={prog.id} className="border-b hairline first:border-t">
              <button
                type="button"
                role="tab"
                id={`tab-${prog.id}`}
                aria-selected={isActive}
                aria-controls="program-panel"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group flex w-full items-center gap-6 py-5 text-left xl:py-6"
              >
                <span
                  className={cn(
                    'flex-1 font-display text-5xl leading-none uppercase transition-all duration-500 ease-[var(--ease-out-expo)] xl:text-6xl',
                    isActive ? 'translate-x-3 text-bone' : 'text-ash-600 group-hover:text-ash-300',
                  )}
                >
                  {prog.title}
                </span>
                <ArrowRight className={cn('size-6 transition-all duration-500', isActive ? 'translate-x-0 text-brand-400 opacity-100' : '-translate-x-4 opacity-0')} />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="lg:col-span-6">
        <div id="program-panel" role="tabpanel" aria-labelledby={`tab-${p.id}`} className="card-lux sticky top-28 overflow-hidden rounded-[1.75rem]">
          <div className="relative aspect-[4/3]">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={p.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease }}
              >
                <Img image={p.image} sizes="45vw" width={1080} className="size-full object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-ash-850 via-ash-850/10 to-transparent" aria-hidden />
            {!p.verified && <PlaceholderBadge label="Availability TBC" className="absolute top-5 right-5" />}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              className="relative -mt-16 p-8 xl:p-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease }}
            >
              <ProgramDetail program={p} onEnquire={() => requestEnquiry(p.title)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/** Extra programme detail ("More"): intro + titled points with gold markers. */
function ProgramMore({ program }: { program: Program }) {
  if (!program.more) return null
  return (
    <div className="border-t border-bone/10 pt-5">
      <p className="text-[0.95rem] leading-relaxed text-bone/85 sm:text-base">{program.more.intro}</p>
      <ul className="mt-4 space-y-3.5">
        {program.more.points.map((pt) => (
          <li key={pt.title} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-brand-400" aria-hidden />
            <p className="text-sm leading-relaxed text-ash-300">
              <span className="font-semibold text-bone">{pt.title}.</span> {pt.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProgramDetail({ program, onEnquire }: { program: Program; onEnquire: () => void }) {
  // Remounted per programme (keyed parent), so "More" starts closed for each one
  const [more, setMore] = useState(false)
  return (
    <>
      <p className="font-display text-3xl text-brand-gradient uppercase">{program.tagline}</p>
      <p className="mt-3 max-w-lg leading-relaxed text-ash-300">{program.description}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {program.focus.map((f) => (
          <li key={f} className="rounded-full border border-bone/12 px-3.5 py-1.5 font-mono text-[0.68rem] tracking-[0.12em] text-ash-300 uppercase">
            {f}
          </li>
        ))}
      </ul>
      {program.more && (
        <>
          <AnimatePresence initial={false}>
            {more && (
              <motion.div
                id={`more-${program.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease }}
                className="overflow-hidden"
              >
                <div className="pt-6">
                  <ProgramMore program={program} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setMore((v) => !v)}
            aria-expanded={more}
            aria-controls={`more-${program.id}`}
            className="mt-5 inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase transition-colors hover:text-brand-200"
          >
            {more ? 'Show less' : 'More about this programme'}
            <CaretDown className={cn('size-3.5 transition-transform duration-300', more && 'rotate-180')} weight="bold" />
          </button>
        </>
      )}
      <div>
        <Button onClick={onEnquire} className="mt-8">
          Enquire about this
        </Button>
      </div>
    </>
  )
}

/* ── Mobile / tablet: swipeable cards with expandable "Learn more" ─────────── */
function MobileCards() {
  const [open, setOpen] = useState<string | null>(null)
  const track = useRef<HTMLDivElement>(null)
  // Scroll state drives the dots and the edge fades
  const [pos, setPos] = useState({ start: true, end: false, active: 0, scrollable: false })

  const update = useCallback(() => {
    const t = track.current
    if (!t) return
    const max = t.scrollWidth - t.clientWidth - 4
    const items = [...t.children] as HTMLElement[]
    const first = items[0]?.offsetLeft ?? 0
    const near = (el: HTMLElement) => Math.abs(el.offsetLeft - first - t.scrollLeft)
    const active = t.scrollLeft >= max ? items.length - 1 : items.reduce((best, el, i) => (near(el) < near(items[best]) ? i : best), 0)
    setPos({ start: t.scrollLeft <= 4, end: t.scrollLeft >= max, active, scrollable: t.scrollWidth > t.clientWidth + 4 })
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const goTo = (i: number) => {
    const t = track.current
    if (!t) return
    const items = [...t.children] as HTMLElement[]
    const target = items[Math.max(0, Math.min(items.length - 1, i))]
    t.scrollTo({ left: target.offsetLeft - items[0].offsetLeft, behavior: 'smooth' })
  }

  return (
    <div className="lg:hidden">
    <div className="relative">
    <div
      ref={track}
      onScroll={() => requestAnimationFrame(update)}
      data-fade-row=""
      data-scrollable={String(pos.scrollable)}
      data-at-start={String(pos.start)}
      data-at-end={String(pos.end)}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar"
    >
      {programs.map((p, i) => {
        const isOpen = open === p.id
        return (
          <Reveal as="article" key={p.id} delay={i * 0.05} className="w-[88%] max-w-md shrink-0 snap-start overflow-hidden rounded-[1.5rem] card-lux sm:w-[58%]">
            <span className="plan-aura pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative aspect-[4/3]">
              <Img image={p.image} sizes="(min-width:640px) 46vw, 82vw" width={768} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ash-850 to-transparent" aria-hidden />
              {!p.verified && <PlaceholderBadge label="TBC" className="absolute top-3 right-3" />}
            </div>
            <div className="-mt-10 p-5">
              <h3 className="relative font-display text-4xl leading-none uppercase">{p.title}</h3>
              <p className="mt-1 font-mono text-[0.68rem] tracking-[0.14em] text-brand-300 uppercase">{p.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-ash-300">{p.description}</p>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
                    <div className="pt-5">
                      <ProgramMore program={p} />
                    </div>
                    <ul className="flex flex-wrap gap-2 pt-5">
                      {p.focus.map((f) => (
                        <li key={f} className="rounded-full border border-bone/12 px-3 py-1 font-mono text-[0.62rem] tracking-[0.1em] text-ash-300 uppercase">
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => requestEnquiry(p.title)} className="mt-5 w-full">
                      Enquire
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={(e) => {
                  // Tap/click: drop focus so no focus box lingers (keyboard users still get the outline)
                  if (e.detail > 0) e.currentTarget.blur()
                  const card = e.currentTarget.closest('article')
                  setOpen(isOpen ? null : p.id)
                  // Collapsing: once the card has folded up, glide back to its top (a smooth scroll started
                  // during the collapse gets cancelled by the layout change)
                  if (isOpen && card) {
                    window.setTimeout(() => window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' }), 420)
                  }
                }}
                aria-expanded={isOpen}
                className="mt-4 min-h-11 font-mono text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase underline decoration-brand-500/60 underline-offset-[6px] transition-colors hover:text-brand-200"
              >
                {isOpen ? 'Less' : 'More'}
              </button>
            </div>
          </Reveal>
        )
      })}
    </div>
    </div>
    <div className="mt-3 flex justify-center gap-2" aria-label="Choose a programme">
      {programs.map((p, i) => (
        <button key={p.id} type="button" className="carousel-dot" aria-current={i === pos.active} aria-label={`Go to ${p.title}`} onClick={() => goTo(i)} />
      ))}
    </div>
    </div>
  )
}
