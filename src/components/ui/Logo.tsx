import { cn } from '../../utils/cn'

/**
 * Official Phoenix Gym emblem (gold phoenix), extracted from the launch poster.
 * ⚠️ It's a raster cut-out from a screenshot (171×218 px), sharp enough for the
 * navbar and footer. Ask the owner for the original vector (SVG/AI/PDF) or a
 * 1000px+ transparent PNG and drop it in at /public/brand/phoenix-emblem.png.
 */
export const EMBLEM_SRC = '/brand/phoenix-emblem.png'

export function LogoMark({ className }: { className?: string }) {
  return <img src={EMBLEM_SRC} alt="" width={171} height={218} className={cn('object-contain', className)} decoding="async" />
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-10 w-auto shrink-0 sm:h-11" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-[1.15rem] font-bold tracking-[0.12em] text-bone sm:text-[1.25rem]">PHOENIX</span>
          <span className="mt-1 font-mono text-[0.52rem] font-semibold tracking-[0.42em] text-brand-400 uppercase">Gym · Vita</span>
        </span>
      )}
    </span>
  )
}
