import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@afterdark/ui'
import { LANDING_IMAGES } from '../../constants/images'
import { LANDING_VIDEOS } from '../../constants/videos'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'

type SectionHeroProps = {
  showAuthCtas?: boolean
  children?: ReactNode
  className?: string
}

export function SectionHero({ showAuthCtas = true, children, className }: SectionHeroProps) {
  const { t } = useTranslation('landing')
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <section
      id="inicio"
      aria-labelledby="landing-brand"
      className={cn('relative min-h-dvh overflow-hidden scroll-mt-0', className)}
    >
      <div className="absolute inset-0">
        {reduceMotion ? (
          <img
            src={LANDING_IMAGES.hero.src}
            srcSet={LANDING_IMAGES.hero.srcSet}
            sizes="100vw"
            width={2400}
            height={1600}
            alt={t('hero.imageAlt')}
            className="h-full w-full object-cover object-[center_35%]"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <video
            className="h-full w-full object-cover object-[center_35%]"
            src={LANDING_VIDEOS.hero}
            poster={LANDING_IMAGES.hero.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={t('hero.imageAlt')}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-background/55 via-background/20 to-background/95"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-background/70 via-background/25 to-transparent"
        />
      </div>

      <div
        className={cn(
          SHELL,
          'relative z-10 flex min-h-dvh flex-col justify-end pb-[max(4rem,8vh)] pt-28 sm:pb-[max(5rem,10vh)]'
        )}
      >
        <div className="max-w-3xl">
          <p
            id="landing-brand"
            className="font-display text-[clamp(2.75rem,12vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-balance text-on-surface"
          >
            {t('nav.brand')}
          </p>
          <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(1.5rem,4.2vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-pretty text-on-surface">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('hero.support')}
          </p>
          {showAuthCtas ? children : null}
        </div>
      </div>
    </section>
  )
}
