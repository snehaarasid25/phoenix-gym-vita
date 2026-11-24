import type { ImgHTMLAttributes } from 'react'
import type { ImageAsset } from '../../types'
import { isUnsplash, sized, srcSet } from '../../utils/image'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  image: ImageAsset
  /** Responsive `sizes` hint — tell the browser how wide the image renders. */
  sizes?: string
  /** Above-the-fold images should be `priority` (eager + high fetch priority). */
  priority?: boolean
  /** Fallback width for the `src` attribute. */
  width?: number
  quality?: number
}

/**
 * Responsive, lazy-loaded image. Works with Unsplash URLs (auto srcset)
 * or local /public paths (served as-is).
 */
export function Img({ image, sizes = '100vw', priority = false, width = 1440, quality, className, style, ...rest }: Props) {
  return (
    <img
      src={sized(image.src, width, quality)}
      srcSet={srcSet(image.src, undefined, quality)}
      sizes={sizes}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={[isUnsplash(image.src) && 'photo-grade', className].filter(Boolean).join(' ') || undefined}
      style={{ objectPosition: image.position, ...style }}
      {...rest}
    />
  )
}
