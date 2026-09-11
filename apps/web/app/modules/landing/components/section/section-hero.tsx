import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { LANDING_IMAGES } from '../../constants/images'

type SectionHeroProps = {
  showAuthCtas?: boolean
  children?: ReactNode
  className?: string
}

const HERO_IN_DELAYS = {
  badge: 0,
  headline: 90,
  support: 180,
  cta: 260,
} as const

function heroInStyle(delayMs: number): CSSProperties {
  return { ['--landing-delay' as string]: delayMs }
}

export function SectionHero({ showAuthCtas = true, children, className }: SectionHeroProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      id="inicio"
      aria-labelledby="hero-heading"
      className={cn(
        'relative flex min-h-[92vh] scroll-mt-0 items-end overflow-hidden bg-surface-dim',
        className
      )}
    >
      <div className="absolute inset-0">
        <img
          src={LANDING_IMAGES.hero.src}
          srcSet={LANDING_IMAGES.hero.srcSet}
          sizes="100vw"
          width={2048}
          height={1152}
          alt={t('hero.imageAlt')}
          className="h-full w-full scale-[1.02] object-cover object-center animate-hero-drift"
          fetchPriority="high"
          decoding="async"
        />
        {/* Dual editorial scrims: bottom surface wash + left depth */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface via-surface/60 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-surface-container-lowest/80 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <Container className="relative z-10 flex w-full flex-col justify-end pt-40 pb-20 sm:pb-28">
        <div
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container/90 px-3.5 py-1.5 shadow-sm backdrop-blur-md animate-landing-hero-in"
          style={heroInStyle(HERO_IN_DELAYS.badge)}
        >
          <span
            className="size-1.5 shrink-0 rounded-full bg-primary animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
          <span className="font-label text-xs font-medium tracking-widest text-on-surface uppercase">
            {t('hero.badge')}
          </span>
        </div>

        <div className="max-w-4xl space-y-4">
          <h1
            id="hero-heading"
            className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-balance text-on-surface animate-landing-hero-in"
            style={heroInStyle(HERO_IN_DELAYS.headline)}
          >
            {t('hero.headline')} <br className="hidden sm:inline" />
            <span className="text-primary">{t('hero.headlineAccent')}</span>
          </h1>
          <p
            className="max-w-xl pt-1 text-base leading-relaxed font-normal text-pretty text-on-surface-variant sm:text-lg animate-landing-hero-in"
            style={heroInStyle(HERO_IN_DELAYS.support)}
          >
            {t('hero.support')}
          </p>
        </div>

        {showAuthCtas ? (
          <div className="animate-landing-hero-in" style={heroInStyle(HERO_IN_DELAYS.cta)}>
            {children}
          </div>
        ) : null}
      </Container>
    </section>
  )
}
