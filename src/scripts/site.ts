/**
 * Site-wide behaviour for the static (zero-framework) sections.
 * ~2 KB: scroll reveals, scroll-linked parallax and "Enquire" buttons.
 */
import Lenis from 'lenis'
import { requestEnquiry } from '../utils/enquiry'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

/* ── Smooth scrolling (Lenis) ─────────────────────────────────────────────
 * Inertial wheel/trackpad scroll for the premium feel; in-page anchors are routed
 * through it. Only on fine pointers: phones keep native momentum scrolling, and
 * reduced-motion users keep plain native scrolling. */
declare global {
  interface Window {
    __lenis?: Lenis
  }
}
if (!reduceMotion && finePointer) {
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 }, autoRaf: true })
  window.__lenis = lenis
}

/* ── Intro curtain: lift once the hero photo is decoded (min ~0.5s, max ~1.1s) ── */
const root = document.documentElement
if (root.classList.contains('intro')) {
  const started = performance.now()
  let lifted = false
  const lift = () => {
    if (lifted) return
    lifted = true
    const wait = Math.max(0, 550 - (performance.now() - started))
    window.setTimeout(() => root.classList.add('is-ready'), wait)
  }
  const heroImg = document.querySelector<HTMLImageElement>('#home img')
  if (heroImg?.complete) lift()
  else heroImg?.decode().then(lift, lift)
  window.setTimeout(lift, 900) // never hold the page longer than this
}

/* ── Scroll reveals ───────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-in')
      revealObserver.unobserve(entry.target)
    }
  },
  { rootMargin: '0px 0px -12% 0px' },
)
document.querySelectorAll('.reveal, .reveal-lines, .reveal-img').forEach((el) => revealObserver.observe(el))

/* ── Parallax ─────────────────────────────────────────────────────────────
 * data-parallax                       marks the element
 * data-parallax-y="6,-6"              translateY in % (start → end)
 * data-parallax-x="4,-8"              translateX in %
 * data-parallax-scale="1.15,1"        scale
 * data-parallax-fade="0.35,0.8"       opacity 1 → 0 across that progress range
 * data-parallax-mode="exit"           progress 0→1 while the host scrolls OUT
 * data-parallax-min="1024"            only at viewport widths ≥ this (e.g. keep phone text fully readable)
 *                                     (default: while it passes through the viewport)
 * Progress is measured on the closest <section> (or <footer>).
 */
type Pair = [number, number]
const pair = (v?: string): Pair | undefined => (v ? (v.split(',').map(Number) as Pair) : undefined)
const lerp = ([a, b]: Pair, t: number) => a + (b - a) * t
const clamp = (t: number) => Math.min(1, Math.max(0, t))

const items = [...document.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => ({
  el,
  host: (el.closest('section, footer') as HTMLElement | null) ?? el,
  exit: el.dataset.parallaxMode === 'exit',
  y: pair(el.dataset.parallaxY),
  x: pair(el.dataset.parallaxX),
  scale: pair(el.dataset.parallaxScale),
  fade: pair(el.dataset.parallaxFade),
  min: Number(el.dataset.parallaxMin ?? 0),
}))

let ticking = false
function update() {
  ticking = false
  const vh = window.innerHeight
  for (const item of items) {
    if (item.min && window.innerWidth < item.min) {
      // effect switched off at this width: make sure nothing is left faded or shifted
      item.el.style.transform = ''
      item.el.style.opacity = ''
      continue
    }
    const r = item.host.getBoundingClientRect()
    if (r.bottom < -vh || r.top > vh * 2) continue
    const t = item.exit ? clamp(-r.top / r.height) : clamp((vh - r.top) / (vh + r.height))
    const parts: string[] = []
    if (item.x) parts.push(`translateX(${lerp(item.x, t)}%)`)
    if (item.y) parts.push(`translateY(${lerp(item.y, t)}%)`)
    if (item.scale) parts.push(`scale(${lerp(item.scale, t)})`)
    if (parts.length) item.el.style.transform = parts.join(' ')
    if (item.fade) {
      const [from, to] = item.fade
      item.el.style.opacity = String(1 - clamp((t - from) / (to - from)))
    }
  }
}
if (!reduceMotion && items.length) {
  const onScroll = () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(update)
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  update()
}

/* ── Hero highlight orbs (phones): tap to open a label; a one-time hint after the intro ── */
{
  const orbs = [...document.querySelectorAll<HTMLButtonElement>('[data-hl]')]
  if (orbs.length) {
    let closeTimer: number | undefined
    let touched = false
    const set = (orb: HTMLButtonElement | null) => orbs.forEach((o) => o.setAttribute('aria-expanded', String(o === orb)))
    const open = (orb: HTMLButtonElement, ms = 3500) => {
      set(orb)
      clearTimeout(closeTimer)
      closeTimer = window.setTimeout(() => set(null), ms)
    }
    orbs.forEach((orb) =>
      orb.addEventListener('click', (e) => {
        e.stopPropagation()
        touched = true
        if (orb.getAttribute('aria-expanded') === 'true') set(null)
        else open(orb)
      }),
    )
    document.addEventListener('click', () => set(null))
    // Teach the interaction once: open each orb in turn shortly after the headline lands
    const phone = window.matchMedia('(max-width: 1023px)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (phone && !calm) {
      orbs.forEach((orb, i) =>
        window.setTimeout(() => {
          if (touched || window.scrollY > 120) return
          open(orb, 1300)
        }, 2400 + i * 1500),
      )
    }
  }
}

/* ── Enquire buttons (data-enquire="Annual membership") ───────────────── */
document.addEventListener('click', (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-enquire]')
  if (trigger) requestEnquiry(trigger.dataset.enquire ?? '')
})

/* ── Official Instagram embeds: load Meta's script only when the section is near ── */
declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}
const igEmbeds = document.querySelector('[data-instagram-embeds]')
if (igEmbeds) {
  const igObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      igObserver.disconnect()
      if (window.instgrm) return window.instgrm.Embeds.process()
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = () => window.instgrm?.Embeds.process()
      document.body.appendChild(script)
    },
    { rootMargin: '600px 0px' },
  )
  igObserver.observe(igEmbeds)
}

/* ── Cursor spotlight on cards (.spotlight) ──────────────────────────── */
if (finePointer) {
  document.addEventListener(
    'pointermove',
    (event) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.spotlight, .card-lux')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${event.clientX - r.left}px`)
      card.style.setProperty('--my', `${event.clientY - r.top}px`)
    },
    { passive: true },
  )
}

/* ── 3D tilt on large cards ([data-tilt]) ─────────────────────────────────
 * Buttons deliberately have NO magnetic/pointer-follow movement: moving a small
 * hit target under the cursor makes it jitter. Their hover is glow + sheen only. */
if (finePointer && !reduceMotion) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    // Set the tilt transition only while hovered, so it never overrides the scroll-reveal transition
    el.addEventListener('pointerenter', () => (el.style.transition = 'transform 0.25s var(--ease-out-quint), opacity 0.9s var(--ease-out-expo)'))
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`
    })
    el.addEventListener('pointerleave', () => (el.style.transform = ''))
  })
}

/* ── Velocity skew on the mantra band (one rAF loop, transforms only) ── */
const skewers = [...document.querySelectorAll<HTMLElement>('[data-velocity-skew]')]
if (skewers.length && !reduceMotion) {
  let lastY = window.scrollY
  let lastT = performance.now()
  let queued = false
  let settle = 0
  const frame = () => {
    queued = false
    const y = window.scrollY
    const now = performance.now()
    const v = (y - lastY) / Math.max(16, now - lastT) // px per ms
    const skew = Math.max(-8, Math.min(8, v * -4))
    skewers.forEach((el) => el.style.setProperty('--skew', `${skew.toFixed(2)}deg`))
    window.clearTimeout(settle)
    settle = window.setTimeout(() => skewers.forEach((el) => el.style.setProperty('--skew', '0deg')), 140)
    lastY = y
    lastT = now
  }
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true
      requestAnimationFrame(frame)
    }
  }, { passive: true })
  frame()
}

/* ── Simple carousels: [data-carousel] track + prev/next buttons + counter ── */
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((track) => {
  const id = track.id
  const prev = document.querySelector<HTMLButtonElement>(`[data-carousel-prev="${id}"]`)
  const next = document.querySelector<HTMLButtonElement>(`[data-carousel-next="${id}"]`)
  const count = document.querySelector<HTMLElement>(`[data-carousel-count="${id}"]`)
  const dotsBox = document.querySelector<HTMLElement>(`[data-carousel-dots="${id}"]`)
  const items = () => [...track.children] as HTMLElement[]
  // Optional position dots (phones): one per card, the active one stretches into a pill
  const dots = dotsBox
    ? items().map((el, i) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'carousel-dot'
        b.setAttribute('aria-label', `Go to card ${i + 1}`)
        b.addEventListener('click', () => track.scrollTo({ left: el.offsetLeft - items()[0].offsetLeft, behavior: 'smooth' }))
        dotsBox.append(b)
        return b
      })
    : []
  const step = () => {
    const [a, b] = items()
    return a && b ? b.offsetLeft - a.offsetLeft : track.clientWidth * 0.8
  }
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 4
    if (prev) prev.disabled = track.scrollLeft <= 4
    if (next) next.disabled = track.scrollLeft >= max
    // Edge fades only where there's more to scroll (see [data-carousel] in index.css)
    track.dataset.atStart = String(track.scrollLeft <= 4)
    track.dataset.atEnd = String(track.scrollLeft >= max)
    track.dataset.scrollable = String(track.scrollWidth > track.clientWidth + 4)
    if (dots.length) {
      const list = items()
      const start = list[0].offsetLeft
      // at the very end the last card may never reach the left edge, so treat "end" as the last card
      const active = track.scrollLeft >= max
        ? list.length - 1
        : list.reduce((best, el, i) => (Math.abs(el.offsetLeft - start - track.scrollLeft) < Math.abs(list[best].offsetLeft - start - track.scrollLeft) ? i : best), 0)
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === active)))
    }
    if (count) {
      // Show the range actually in view, e.g. "01–04 / 05"
      const list = items()
      const box = track.getBoundingClientRect()
      const visible = list
        .map((el, i) => ({ i, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.left >= box.left - 8 && r.right <= box.right + 8)
        .map(({ i }) => i + 1)
      const pad = (n: number) => String(n).padStart(2, '0')
      const first = visible[0] ?? 1
      const last = visible[visible.length - 1] ?? first
      count.textContent = `${pad(first)}${last > first ? `–${pad(last)}` : ''} / ${pad(list.length)}`
    }
  }
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }))
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }))
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true })
  window.addEventListener('resize', update)
  update()
})
