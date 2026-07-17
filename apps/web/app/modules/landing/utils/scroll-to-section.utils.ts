const SCROLL_DURATION_MS = 700

let activeScrollFrame = 0

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function animateScrollTo(top: number) {
  cancelAnimationFrame(activeScrollFrame)

  const startY = window.scrollY
  const distance = top - startY
  if (Math.abs(distance) < 1) return

  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1)
    window.scrollTo(0, startY + distance * easeInOutCubic(progress))
    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step)
    }
  }

  activeScrollFrame = requestAnimationFrame(step)
}

/** Smooth scroll to a landing section by hash (`#como-funciona`) or id. */
export function scrollToSection(hash: string) {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  const el = document.getElementById(id)
  if (!el) return

  if (prefersReducedMotion()) {
    el.scrollIntoView({ behavior: 'auto', block: 'start' })
    return
  }

  const scrollMarginTop = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const top = el.getBoundingClientRect().top + window.scrollY - scrollMarginTop
  animateScrollTo(top)
}

export function handleSectionNavClick(event: { preventDefault: () => void }, hash: string) {
  event.preventDefault()
  scrollToSection(hash)
  window.history.replaceState(null, '', hash.startsWith('#') ? hash : `#${hash}`)
}
