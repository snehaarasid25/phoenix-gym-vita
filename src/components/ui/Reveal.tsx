import { motion, type HTMLMotionProps } from 'motion/react'

interface Props extends HTMLMotionProps<'div'> {
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'article' | 'span'
}

/**
 * Scroll-triggered fade/slide reveal. Uses Motion's IntersectionObserver-based
 * `whileInView`; automatically respects prefers-reduced-motion via MotionConfig.
 */
export function Reveal({ delay = 0, y = 32, as = 'div', children, ...rest }: Props) {
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
