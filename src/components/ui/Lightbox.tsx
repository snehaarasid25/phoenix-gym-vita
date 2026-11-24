import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import type { ImageAsset } from '../../types'
import { sized } from '../../utils/image'

interface Props {
  images: ImageAsset[]
  index: number | null
  onChange: (index: number | null) => void
}

/**
 * Accessible image lightbox: keyboard (←/→/Esc), swipe on touch,
 * focus moved into the dialog and restored on close.
 */
export function Lightbox({ images, index, onChange }: Props) {
  const open = index !== null
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  useLockBodyScroll(open)

  const go = useCallback(
    (dir: 1 | -1) => index !== null && onChange((index + dir + images.length) % images.length),
    [index, images.length, onChange],
  )
  const close = useCallback(() => onChange(null), [onChange])

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lastFocus.current?.focus()
    }
  }, [open, go, close])

  // Preload neighbours for instant navigation
  useEffect(() => {
    if (index === null) return
    ;[1, -1].forEach((d) => {
      const img = images[(index + d + images.length) % images.length]
      if (img) new Image().src = sized(img.src, 1920, 80)
    })
  }, [index, images])

  const current = index !== null ? images[index] : null

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          data-theme="dark"
          className="fixed inset-0 z-[70] flex flex-col bg-ash-950/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-8" onClick={(e) => e.stopPropagation()}>
            <span className="font-mono text-xs tracking-[0.2em] text-ash-300">
              <span className="text-bone">{String(index! + 1).padStart(2, '0')}</span> / {String(images.length).padStart(2, '0')}
            </span>
            <button ref={closeRef} type="button" onClick={close} aria-label="Close image viewer" className="grid size-12 place-items-center rounded-full border border-bone/20 text-bone transition-colors hover:border-brand-400 hover:text-brand-300">
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-20">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={current.src}
                src={sized(current.src, 1920, 80)}
                alt={current.alt}
                className="max-h-[78svh] max-w-full cursor-grab rounded-xl object-contain shadow-2xl active:cursor-grabbing"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1)
                  else if (info.offset.x > 80) go(-1)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>

            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous image" className="absolute left-4 hidden size-14 place-items-center rounded-full border border-bone/20 bg-ash-950/50 text-bone transition-colors hover:border-brand-400 hover:text-brand-300 sm:grid">
              <CaretLeft className="size-6" weight="bold" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next image" className="absolute right-4 hidden size-14 place-items-center rounded-full border border-bone/20 bg-ash-950/50 text-bone transition-colors hover:border-brand-400 hover:text-brand-300 sm:grid">
              <CaretRight className="size-6" weight="bold" />
            </button>
          </div>

          <p className="px-6 py-6 text-center text-sm text-ash-300" onClick={(e) => e.stopPropagation()}>
            {current.alt}
            <span className="mt-1 block font-mono text-[0.6rem] tracking-[0.16em] text-ash-400 uppercase sm:hidden">Swipe to browse</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
