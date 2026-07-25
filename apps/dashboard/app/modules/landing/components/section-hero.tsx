import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@repo/ui'
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
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-hairline/60"
    >
      <div aria-hidden className="absolute inset-0">
        {reduceMotion ? (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklch,var(--color-primary)_16%,transparent)_0%,transparent_55%),radial-gradient(ellipse_at_90%_100%,color-mix(in_oklch,var(--color-inverse-primary)_10%,transparent)_0%,transparent_45%)]" />
        ) : (
          <video
            className="h-full w-full object-cover"
            src={LANDING_VIDEOS.hero}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/60 to-background/95" />
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-margin-mobile py-[clamp(5rem,12vw,9rem)] text-center md:px-margin-desktop">
        <p className="font-label text-sm font-medium tracking-label-sm text-primary uppercase">
          {t('hero.eyebrow')}
        </p>
        <h1
          id="hero-heading"
          className="mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-balance text-on-surface"
        >
          {t('hero.headline')}
        </h1>
        <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
          {t('hero.support')}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to={DASHBOARD_ROUTES.register()}>{t('hero.ctaPrimary')}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={DASHBOARD_ROUTES.login()}>{t('hero.ctaSecondary')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
