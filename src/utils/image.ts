const UNSPLASH = 'images.unsplash.com'

export const isUnsplash = (src: string) => src.includes(UNSPLASH)

/**
 * Local responsive images produced by photos/enhance.py use a `{w}` placeholder,
 * e.g. '/images/phoenix/hero-athlete-{w}.webp', with these widths available.
 */
export const LOCAL_WIDTHS = [640, 960, 1280, 1600, 2000, 2560, 3200]
const isLocalVariant = (src: string) => src.includes('{w}')

/** URL for an image at (at least) the requested display width. */
export function sized(src: string, width: number, quality = 72) {
  if (isLocalVariant(src)) {
    const w = LOCAL_WIDTHS.find((x) => x >= width) ?? LOCAL_WIDTHS[LOCAL_WIDTHS.length - 1]
    return src.replace('{w}', String(w))
  }
  if (!isUnsplash(src)) return src
  const url = new URL(src)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality))
  return url.toString()
}

const DEFAULT_WIDTHS = [480, 768, 1080, 1440, 1920]

export function srcSet(src: string, widths = DEFAULT_WIDTHS, quality?: number) {
  if (isLocalVariant(src)) return LOCAL_WIDTHS.map((w) => `${src.replace('{w}', String(w))} ${w}w`).join(', ')
  if (!isUnsplash(src)) return undefined
  return widths.map((w) => `${sized(src, w, quality)} ${w}w`).join(', ')
}
