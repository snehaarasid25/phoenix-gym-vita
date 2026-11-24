import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowsOut } from '@phosphor-icons/react'
import { galleryImages } from '../../config/images'
import { Img } from '../ui/Img'
import { Lightbox } from '../ui/Lightbox'
import type { GalleryImage } from '../../types'
import { cn } from '../../utils/cn'

const filters = ['All', 'Interior', 'Equipment', 'Training', 'Lifestyle'] as const
type Filter = (typeof filters)[number]

/** Filterable masonry gallery + lightbox (React island, hydrated when visible). */
export default function GalleryGrid() {
  const [filter, setFilter] = useState<Filter>('All')
  const [index, setIndex] = useState<number | null>(null)

  const items = useMemo<GalleryImage[]>(
    () => (filter === 'All' ? galleryImages : galleryImages.filter((g) => g.category === filter)),
    [filter],
  )
  const available = filters.filter((f) => f === 'All' || galleryImages.some((g) => g.category === f))

  return (
    <>
        <div className="mt-12 flex gap-2 overflow-x-auto no-scrollbar sm:mt-16" role="group" aria-label="Filter gallery">
          {available.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                'relative h-11 shrink-0 rounded-full px-5 font-mono text-[0.7rem] font-medium tracking-[0.16em] uppercase transition-colors',
                filter === f ? 'text-ash-950' : 'border border-bone/15 text-ash-300 hover:border-bone/40 hover:text-bone',
              )}
            >
              {filter === f && <motion.span layoutId="gallery-filter" className="absolute inset-0 rounded-full bg-bone" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              <span className="relative">{f}</span>
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-8 columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
          <AnimatePresence mode="popLayout">
            {items.map((img, i) => (
              <motion.li
                key={img.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 break-inside-avoid sm:mb-4"
              >
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  data-theme="dark"
                  aria-label={`Open image: ${img.alt}`}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-ash-800"
                  style={{ aspectRatio: img.ratio }}
                >
                  <Img image={img} sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw" width={768} className="size-full object-cover transition-all duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06] group-hover:brightness-110" />
                  <span className="absolute inset-0 bg-gradient-to-t from-ash-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                  <span className="absolute right-3 bottom-3 left-3 flex translate-y-2 items-center justify-between opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="font-mono text-[0.62rem] tracking-[0.16em] text-bone uppercase">{img.category}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-brand-500 text-ink">
                      <ArrowsOut className="size-3.5" weight="bold" />
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

      <Lightbox images={items} index={index} onChange={setIndex} />
    </>
  )
}
