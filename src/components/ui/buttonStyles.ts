import { cn } from '../../utils/cn'

type Variant = 'primary' | 'ghost' | 'outline' | 'light'
type Size = 'md' | 'lg'

const base =
  'group relative inline-flex shrink-0 select-none whitespace-nowrap items-center justify-center gap-3 overflow-hidden rounded-full font-mono font-semibold uppercase tracking-[0.14em] transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    // Theme-aware: ink on ivory, gold inside dark sections (tokens in styles/index.css)
    'btn-shine btn-primary',
  ghost: 'glass text-bone hover:bg-bone/10',
  outline: 'border border-bone/25 text-bone hover:border-brand-400 hover:text-brand-300',
  light: 'bg-bone text-ash-950 hover:bg-bone/85',
}

const sizes: Record<Size, string> = {
  md: 'h-12 px-6 text-[0.72rem]',
  lg: 'h-14 px-8 text-xs sm:h-16 sm:px-9',
}

export type ButtonVariant = Variant
export type ButtonSize = Size

/** Shared by the React <Button>/<ButtonLink> and ButtonLink.astro so they are pixel-identical. */
export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className)
