import type { MouseEvent } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { applyTheme, getTheme } from '../../utils/theme'
import { cn } from '../../utils/cn'

/**
 * Light / dark switch. The icon is driven purely by CSS (`theme-light:`
 * variant), so the prerendered HTML never mismatches on hydration.
 * Where supported, the new theme is revealed in a circle from the click point.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = getTheme() === 'dark' ? 'light' : 'dark'
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next)
      return
    }
    // Keyboard activation has no pointer position: use the button's centre
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX || rect.left + rect.width / 2
    const y = e.clientY || rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = document.startViewTransition(() => applyTheme(next))
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={cn(
        'group grid size-12 shrink-0 place-items-center rounded-full border border-bone/15 bg-ash-950/40 text-bone backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-300',
        className,
      )}
    >
      <Sun className="size-5 transition-transform duration-500 group-hover:rotate-45 theme-light:hidden" weight="duotone" aria-hidden />
      <Moon className="hidden size-5 transition-transform duration-500 group-hover:-rotate-12 theme-light:block" weight="duotone" aria-hidden />
    </button>
  )
}
