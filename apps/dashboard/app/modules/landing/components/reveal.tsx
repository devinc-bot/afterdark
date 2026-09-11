import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react'
import { cn } from '@repo/ui'

type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

type UseRevealEntranceResult = {
  ref: RefObject<HTMLElement | null>
  runEntrance: boolean
}

/**
 * Shared IO entrance: content stays visible; `runEntrance` only adds animation.
 * Skips when reduced-motion, already in view (incl. hash), or after failsafe.
 */
export function useRevealEntrance(): UseRevealEntranceResult {
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
        if (target && (target === el || target.contains(el) || el.contains(target))) {
          return true
        }
      }
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    }

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

    const failsafe = window.setTimeout(() => {
      settled = true
      observer.disconnect()
    }, 1500)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return { ref, runEntrance }
}

export function staggerStyle(index: number): CSSProperties {
  return { ['--i' as string]: index }
}

/**
 * Progressive scroll entrance. Content is always visible — never gated on
 * opacity-0. Animation is additive enhancement only.
 */
export function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  const { ref, runEntrance } = useRevealEntrance()

  return (
    <Tag ref={ref as never} className={cn(className, runEntrance && 'animate-landing-fade')}>
      {children}
    </Tag>
  )
}
