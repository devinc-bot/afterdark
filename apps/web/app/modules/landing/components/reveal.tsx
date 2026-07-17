import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { cn } from '@afterdark/ui'

type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

/**
 * One-shot scroll fade-in. Disconnects the observer after reveal
 * so cost stays low when used sparingly (section blocks, not every card).
 */
export function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [willAnimate, setWillAnimate] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    setWillAnimate(true)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={cn(
        className,
        willAnimate && !visible && 'opacity-0',
        willAnimate && visible && 'animate-landing-fade'
      )}
    >
      {children}
    </Tag>
  )
}
