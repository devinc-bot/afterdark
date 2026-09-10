import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { LANDING_IMAGES } from '../../constants/images'

type SectionHeroProps = {
  showAuthCtas?: boolean
  children?: ReactNode
  className?: string
}

export function SectionHero({ showAuthCtas = true, children, className }: SectionHeroProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      id="inicio"
      aria-labelledby="landing-brand"
      className={cn('relative min-h-dvh overflow-hidden scroll-mt-0', className)}
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
        {/* Soft scrim: gradient from transparent toward bottom for text contrast over media */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/15"
          aria-hidden
        />
      </div>

      {/* Subtle geometric accent — hairline mark */}
      <div
        className="pointer-events-none absolute bottom-[max(5.5rem,14vh)] left-0 hidden h-px w-10 bg-white/35 sm:block"
        aria-hidden
      />

      <Container className="relative z-10 flex min-h-dvh flex-col justify-end pb-[max(5.5rem,12vh)] pt-28 sm:pb-[max(6.5rem,14vh)]">
        <div className="max-w-3xl">
          <p
            id="landing-brand"
            className="font-display text-[clamp(2.75rem,12vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-balance text-white"
          >
            {t('nav.brand')}
          </p>
          <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(1.5rem,4.2vw,2.5rem)] font-semibold leading-tight -tracking-label-md text-pretty text-white">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-pretty text-white/85 sm:text-lg">
            {t('hero.support')}
          </p>
          {showAuthCtas ? children : null}
        </div>
      </Container>
    </section>
  )
}
