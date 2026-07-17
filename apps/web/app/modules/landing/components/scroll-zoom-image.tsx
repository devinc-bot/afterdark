import { useEffect, useRef, type ImgHTMLAttributes } from 'react'
import { cn } from '@afterdark/ui'

type ScrollZoomImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Wrapper classes (must include overflow-hidden for the zoom). */
  containerClassName?: string
  /** Peak scale at section center. Default 1.28. */
  maxScale?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Zoom-in toward viewport center / zoom-out at edges while scrolling.
 * Updates only while the container is intersecting (cheap for a few section images).
 */
export function ScrollZoomImage({
  containerClassName,
  className,
  maxScale = 1.28,
  alt,
  ...imgProps
}: ScrollZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let rafId = 0
    let active = false
    const zoomRange = maxScale - 1

    const update = () => {
      const rect = container.getBoundingClientRect()
      const viewH = window.innerHeight
      const total = viewH + rect.height
      if (total <= 0) return

      const progress = clamp((viewH - rect.top) / total, 0, 1)
      // 0 at edges → 1 at center → zoom in mid-scroll, out at edges
      const intensity = 1 - Math.abs(progress - 0.5) * 2
      const scale = 1 + intensity * zoomRange
      img.style.transform = `scale(${scale.toFixed(4)})`
    }

    const schedule = () => {
      if (!active) return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = Boolean(entry?.isIntersecting)
        if (active) {
          img.style.willChange = 'transform'
          schedule()
        } else {
          img.style.willChange = 'auto'
          cancelAnimationFrame(rafId)
        }
      },
      { rootMargin: '10% 0px' }
    )

    observer.observe(container)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(rafId)
      img.style.willChange = 'auto'
    }
  }, [maxScale])

  return (
    <div ref={containerRef} className={cn('overflow-hidden', containerClassName)}>
      <img
        ref={imgRef}
        alt={alt}
        className={cn('h-full w-full object-cover transition-none', className)}
        {...imgProps}
      />
    </div>
  )
}
