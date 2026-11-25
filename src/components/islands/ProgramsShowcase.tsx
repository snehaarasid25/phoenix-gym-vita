import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Plus } from '@phosphor-icons/react'
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
                <span className={cn('font-mono text-xs transition-colors', isActive ? 'text-brand-400' : 'text-ash-400')}>{prog.index}</span>
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

function ProgramDetail({ program, onEnquire }: { program: Program; onEnquire: () => void }) {
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
      <Button onClick={onEnquire} className="mt-8">
        Enquire about this
      </Button>
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
            <div className="relative aspect-[4/3]">
              <Img image={p.image} sizes="(min-width:640px) 46vw, 82vw" width={768} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ash-850 to-transparent" aria-hidden />
              <span className="absolute top-4 left-4 font-mono text-xs text-bone/80">{p.index}</span>
              {!p.verified && <PlaceholderBadge label="TBC" className="absolute top-3 right-3" />}
            </div>
            <div className="-mt-10 p-5">
              <h3 className="relative font-display text-4xl leading-none uppercase">{p.title}</h3>
              <p className="mt-1 font-mono text-[0.68rem] tracking-[0.14em] text-brand-300 uppercase">{p.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-ash-300">{p.description}</p>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
                    <ul className="flex flex-wrap gap-2 pt-4">
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
                onClick={() => setOpen(isOpen ? null : p.id)}
                aria-expanded={isOpen}
                className="mt-4 flex min-h-11 items-center gap-2 font-mono text-xs font-semibold tracking-[0.16em] text-bone uppercase"
              >
                <span className={cn('grid size-7 place-items-center rounded-full border border-bone/20 transition-transform duration-300', isOpen && 'rotate-45 border-brand-400 text-brand-400')}>
                  <Plus className="size-3.5" weight="bold" />
                </span>
                {isOpen ? 'Show less' : 'Learn more'}
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
