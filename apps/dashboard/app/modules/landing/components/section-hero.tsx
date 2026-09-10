import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import { LANDING_IMAGES } from '../constants/images'

export function SectionHero() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="inicio"
      aria-labelledby="landing-brand"
      className="relative min-h-[min(100dvh,52rem)] w-full overflow-hidden border-b border-hairline/60"
    >
      <div className="absolute inset-0">
        <img
          src={LANDING_IMAGES.hero.src}
          srcSet={LANDING_IMAGES.hero.srcSet}
          sizes="100vw"
          width={2048}
          height={1152}
          alt={t('hero.imageAlt')}
          className="h-full w-full object-cover object-[center_35%]"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/15"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(100dvh,52rem)] w-full max-w-6xl flex-col justify-end px-margin-mobile pb-[max(5rem,10vh)] pt-28 md:px-margin-desktop sm:pb-[max(6rem,12vh)]">
        <div className="max-w-3xl">
          <p
            id="landing-brand"
            className="font-display text-[clamp(2.75rem,10vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance text-white"
          >
            {t('header.brand')}
          </p>
          <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(1.5rem,3.8vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-pretty text-white">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-pretty text-white/85 sm:text-lg">
            {t('hero.support')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="px-8">
              <Link to={DASHBOARD_ROUTES.register()}>{t('hero.ctaPrimary')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to={DASHBOARD_ROUTES.login()}>{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
