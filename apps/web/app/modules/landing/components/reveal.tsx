import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { cn } from '@afterdark/ui'

type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

/**
 * Progressive scroll entrance. Content is always visible — never gated on
 * opacity-0 — so hash jumps, fast scroll, hidden tabs, and failed observers
 * cannot ship blank sections. Animation is additive enhancement only.
 */
export function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [runEntrance, setRunEntrance] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const alreadyInView = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const target = document.getElementById(hash)
        if (target && (target === el || target.contains(el))) return true
      }
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }

    // Already on screen (incl. #hash): keep static — no blanking animation.
    if (alreadyInView()) return

    let settled = false
    const play = () => {
      if (settled) return
      settled = true
      setRunEntrance(true)
      observer.disconnect()
      window.clearTimeout(failsafe)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        play()
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.08 }
    )

    observer.observe(el)

    // If IO never fires, leave content visible (static). Do not animate late.
    const failsafe = window.setTimeout(() => {
      settled = true
      observer.disconnect()
    }, 1500)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <Tag ref={ref as never} className={cn(className, runEntrance && 'animate-landing-fade')}>
      {children}
    </Tag>
  )
}
