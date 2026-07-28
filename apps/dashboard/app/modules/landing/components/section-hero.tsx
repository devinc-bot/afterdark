import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button, cn } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { LANDING_VIDEOS } from '../constants/videos'

export function SectionHero() {
  const { t } = useTranslation('dashboardLanding')
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
      className="relative min-h-[min(100dvh,52rem)] overflow-hidden border-b border-hairline/60"
    >
      <div aria-hidden className="absolute inset-0">
        {reduceMotion ? (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklch,var(--color-primary)_16%,transparent)_0%,transparent_55%),radial-gradient(ellipse_at_90%_100%,color-mix(in_oklch,var(--color-inverse-primary)_10%,transparent)_0%,transparent_45%)]" />
        ) : (
          <video
            className={cn('h-full w-full object-cover object-[center_35%]', 'animate-hero-drift')}
            src={LANDING_VIDEOS.hero}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-background/55 via-background/45 to-background" />
        <div className="absolute inset-0 bg-linear-to-r from-background/75 via-background/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(100dvh,52rem)] w-full max-w-6xl flex-col justify-end px-margin-mobile pb-[max(4rem,8vh)] pt-28 md:px-margin-desktop sm:pb-[max(5rem,10vh)]">
        <div
          className="max-w-3xl animate-landing-fade"
          style={{ ['--landing-delay' as string]: 0 }}
        >
          <p
            id="landing-brand"
            className="font-display text-[clamp(2.75rem,10vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-balance text-on-surface"
          >
            {t('header.brand')}
          </p>
          <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(1.5rem,3.8vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-pretty text-on-surface">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('hero.support')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="px-8">
              <Link to={DASHBOARD_ROUTES.register()}>{t('hero.ctaPrimary')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={DASHBOARD_ROUTES.login()}>{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
