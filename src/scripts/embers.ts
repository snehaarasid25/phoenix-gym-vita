/**
 * Rising gold embers: a lightweight 2D-canvas particle field (no Three.js).
 * ~70 particles, pauses when off-screen or the tab is hidden, DPR-aware.
 */
type Ember = { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number; hue: number }

export function initEmbers(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let w = 0
  let h = 0
  let running = false
  let raf = 0
  const count = window.innerWidth < 768 ? 36 : 70
  const embers: Ember[] = []

  const resize = () => {
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  const spawn = (initial = false): Ember => ({
    x: Math.random() * w,
    y: initial ? Math.random() * h : h + 10,
    r: Math.random() * 1.8 + 0.4,
    vy: Math.random() * 0.55 + 0.2,
    vx: (Math.random() - 0.5) * 0.25,
    life: 0,
    max: Math.random() * 500 + 300,
    hue: 30 + Math.random() * 14,
  })

  const tick = () => {
    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i]
      e.life++
      e.y -= e.vy
      e.x += e.vx + Math.sin((e.life + i * 40) / 60) * 0.18
      const fade = Math.min(1, e.life / 60) * Math.max(0, 1 - e.life / e.max)
      if (e.y < -10 || e.life > e.max) {
        embers[i] = spawn()
        continue
      }
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4)
      g.addColorStop(0, `hsla(${e.hue}, 90%, 72%, ${0.9 * fade})`)
      g.addColorStop(1, `hsla(${e.hue}, 90%, 55%, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2)
      ctx.fill()
    }
    raf = requestAnimationFrame(tick)
  }
  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(tick)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  resize()
  for (let i = 0; i < count; i++) embers.push(spawn(true))
  window.addEventListener('resize', resize)
  new IntersectionObserver(([entry]) => (entry?.isIntersecting && !document.hidden ? start() : stop())).observe(canvas)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
}
