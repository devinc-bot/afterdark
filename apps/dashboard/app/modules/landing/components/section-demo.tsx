import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LANDING_IMAGES } from '../constants/images'
import { LANDING_VIDEOS } from '../constants/videos'

export function SectionDemo() {
  const { t } = useTranslation('dashboardLanding')
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      return
    }

    const visibilityThreshold = 0.25
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= visibilityThreshold) {
          void video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: [0, visibilityThreshold, 1] }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [])

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="relative z-20 -mt-10 scroll-mt-20 border-b border-hairline/60 sm:-mt-14"
    >
      <div className="mx-auto w-full max-w-6xl px-margin-mobile pb-[clamp(4rem,8vw,6.5rem)] md:px-margin-desktop">
        <div className="overflow-hidden rounded-app bg-surface-container-low panel p-2">
          <div className="grid gap-0 lg:grid-cols-12">
            <div className="flex flex-col justify-center gap-4 px-margin-mobile py-10 md:px-10 lg:col-span-4 lg:px-12 lg:py-12">
              <h2
                id="demo-heading"
                className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] -tracking-label-md text-balance text-on-surface"
              >
                {t('demo.headline')}
              </h2>
              <p className="max-w-[40ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('demo.support')}
              </p>
            </div>
            <div className="aspect-video bg-surface-container lg:col-span-8 lg:aspect-auto lg:min-h-88 rounded-app-sm overflow-hidden">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src={LANDING_VIDEOS.promo}
                poster={LANDING_IMAGES.demoPoster.src}
                muted
                playsInline
                loop
                preload="metadata"
                aria-label={t('demo.videoLabel')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
