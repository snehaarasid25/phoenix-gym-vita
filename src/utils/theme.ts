export type Theme = 'dark' | 'light'

/** localStorage key. Also referenced by the no-flash inline script in layouts/BaseLayout.astro. */
const THEME_STORAGE_KEY = 'phoenix-theme'

/** Browser UI colour (address bar on mobile) for each theme. */
const THEME_COLOR: Record<Theme, string> = { dark: '#070605', light: '#f7f3ec' }

export const getTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* private mode / storage blocked: theme still applies for this visit */
  }
}
