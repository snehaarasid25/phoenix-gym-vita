import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/** Infinite horizontal ticker. Content is duplicated for a seamless loop. */
export function Marquee({ children, className, reverse = false }: { children: ReactNode; className?: string; reverse?: boolean }) {
  return (
    <div className={cn('flex overflow-hidden', className)} aria-hidden>
      <div className={cn('flex shrink-0 animate-marquee items-center motion-reduce:animate-none', reverse && '[animation-direction:reverse]')}>
        {children}
        {children}
      </div>
    </div>
  )
}
