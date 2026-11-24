import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'

import { buttonClasses, type ButtonSize as Size, type ButtonVariant as Variant } from './buttonStyles'

interface Common {
  /** Periodic light sweep (sweeps once, then rests). Use on 1–2 hero-level CTAs only. */
  sheen?: boolean
  variant?: Variant
  size?: Size
  icon?: ReactNode | false
  children: ReactNode
  className?: string
}

const Inner = ({ children, icon, sheen }: { children: ReactNode; icon?: ReactNode | false; sheen?: boolean }) => (
  <>
    {sheen && <span className="sheen motion-reduce:hidden" aria-hidden />}
    <span className="relative z-10">{children}</span>
    {icon !== false && (
      icon ? (
        <span className="relative z-10 grid size-6 place-items-center transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden>
          {icon}
        </span>
      ) : (
        // Default arrow swaps out diagonally on hover (see .arrow-swap in index.css)
        <span className="arrow-swap relative z-10 size-6 place-items-center" aria-hidden>
          <ArrowUpRight className="size-4" weight="bold" />
          <ArrowUpRight className="size-4" weight="bold" />
        </span>
      )
    )}
  </>
)

export function ButtonLink({ variant = 'primary', size = 'md', icon, sheen, children, className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = rest.href?.startsWith('http')
  return (
    <a
      className={buttonClasses(variant, size, className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      <Inner icon={icon} sheen={sheen}>{children}</Inner>
    </a>
  )
}

export function Button({ variant = 'primary', size = 'md', icon, sheen, children, className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      <Inner icon={icon} sheen={sheen}>{children}</Inner>
    </button>
  )
}
