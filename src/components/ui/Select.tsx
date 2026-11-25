import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { cn } from '../../utils/cn'

export interface SelectGroup {
  label: string
  options: string[]
}

interface Props {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  groups: SelectGroup[]
  /** Classes for the trigger (shared with the other form fields). */
  fieldClassName: string
  /** Classes for the floating label. */
  labelClassName: string
}

interface Position {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
  up: boolean
  /** Where the panel is portalled: the open <dialog> the field sits in (top layer), else <body>. */
  host: Element
}

/** Space kept clear for the fixed header (top) and the phone action bar (bottom). */
const HEADER_SPACE = 88
const bottomSpace = () => (window.innerWidth < 640 ? 100 : 16)
const IDEAL_HEIGHT = 340
const noop = () => () => {}

/**
 * Branded dropdown (select-only combobox). The panel is portalled to <body> (or to the open
 * <dialog> it sits in, which is drawn above everything) with fixed
 * positioning, so animated/transformed ancestors can't clip or cover it, and it flips
 * upwards when there isn't room below (never runs under the phone action bar).
 */
export function Select({ id, label, placeholder, value, onChange, groups, fieldClassName, labelClassName }: Props) {
  // true only on the client (portals need document.body); avoids a hydration mismatch
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState<Position | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLUListElement>(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const listId = `${uid}-list`
  const labelId = `${id}-label`
  const flat = groups.flatMap((g) => g.options)
  const optionId = (i: number) => `${uid}-opt-${i}`

  const place = () => {
    const el = trigger.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vh = window.innerHeight
    const below = vh - r.bottom - bottomSpace()
    const above = r.top - HEADER_SPACE
    const up = below < Math.min(IDEAL_HEIGHT, 260) && above > below
    const maxHeight = Math.max(160, Math.min(IDEAL_HEIGHT, (up ? above : below) - 10))
    const host = el.closest('dialog') ?? document.body
    setPos(up ? { left: r.left, width: r.width, bottom: vh - r.top + 8, maxHeight, up, host } : { left: r.left, width: r.width, top: r.bottom + 8, maxHeight, up, host })
  }

  const openList = () => {
    const el = trigger.current
    if (el) {
      // Too cramped either way (e.g. field at the very bottom of a phone screen)? Bring it to the middle first.
      const r = el.getBoundingClientRect()
      const room = Math.max(window.innerHeight - r.bottom - bottomSpace(), r.top - HEADER_SPACE)
      if (room < 240) el.scrollIntoView({ block: 'center' })
    }
    setActive(Math.max(0, flat.indexOf(value)))
    setOpen(true)
  }

  const choose = (option: string) => {
    onChange(option)
    setOpen(false)
    trigger.current?.focus()
  }

  // Keep the panel glued to the field while open
  useLayoutEffect(() => {
    if (!open) return
    place()
    const update = () => place()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close on outside press
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!trigger.current?.contains(t) && !panel.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Keep the highlighted option in view
  useEffect(() => {
    if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive((i) => Math.min(flat.length - 1, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((i) => Math.max(0, i - 1))
        break
      case 'Home':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
        e.preventDefault()
        setActive(flat.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (active >= 0) choose(flat[active])
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className="relative">
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${id}`}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(fieldClassName, 'block truncate pr-11 text-left', open && 'border-brand-400')}
      >
        <span className={value ? 'text-bone' : 'text-ash-400'}>{value || placeholder}</span>
      </button>
      <span id={labelId} className={cn(labelClassName, open && 'text-brand-300')}>
        {label}
      </span>
      <CaretDown
        className={cn('pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ash-400 transition-transform duration-300', open && 'rotate-180 text-brand-400')}
        weight="bold"
        aria-hidden
      />

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.ul
                ref={panel}
                id={listId}
                role="listbox"
                aria-labelledby={labelId}
                initial={{ opacity: 0, y: pos.up ? 8 : -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight, transformOrigin: pos.up ? 'bottom' : 'top' }}
                className="no-scrollbar z-[70] overflow-y-auto overscroll-contain rounded-2xl border border-brand-500/30 bg-ash-850/95 p-1.5 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl"
              >
                {groups.map((g) => (
                  <li key={g.label} role="presentation">
                    <p className="flex items-center gap-2 px-3 pt-3 pb-1.5 font-mono text-[0.6rem] font-semibold tracking-[0.18em] text-brand-400 uppercase" aria-hidden>
                      {g.label}
                      <span className="h-px flex-1 bg-gradient-to-r from-brand-500/30 to-transparent" />
                    </p>
                    <ul role="group" aria-label={g.label}>
                      {g.options.map((o) => {
                        const i = flat.indexOf(o)
                        const selected = o === value
                        return (
                          <li
                            key={o}
                            id={optionId(i)}
                            role="option"
                            aria-selected={selected}
                            onPointerEnter={() => setActive(i)}
                            onClick={() => choose(o)}
                            className={cn(
                              'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] transition-colors duration-150',
                              i === active ? 'bg-brand-500/15 text-bone' : 'text-ash-300',
                              selected && 'font-medium text-bone',
                            )}
                          >
                            <span>{o}</span>
                            {selected && <Check className="size-4 shrink-0 text-brand-400" weight="bold" />}
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>,
          pos?.host ?? document.body,
        )}
    </div>
  )
}
