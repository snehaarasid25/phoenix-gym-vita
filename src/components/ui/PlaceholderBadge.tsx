import { SHOW_PLACEHOLDER_BADGES } from '../../config/site'
import { cn } from '../../utils/cn'

/**
 * Dev-only marker for content that still needs verification from the gym.
 * Never rendered in production builds.
 */
export function PlaceholderBadge({ label = 'Placeholder', className }: { label?: string; className?: string }) {
  if (!SHOW_PLACEHOLDER_BADGES) return null
  return (
    <span
      title="Development marker: this content needs to be verified or replaced before launch."
      className={cn(
        'pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold/60 bg-ash-950/80 px-2.5 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.16em] text-gold uppercase backdrop-blur',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-gold" aria-hidden />
      {label}
    </span>
  )
}
