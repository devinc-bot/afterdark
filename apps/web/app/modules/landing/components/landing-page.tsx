import { useTranslation } from 'react-i18next'
import { getCookieSync } from '@afterdark/common'
import { Link, cn } from '@afterdark/ui'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { LANDING_IMAGES } from '../constants/images'
import { CardSteps } from './cards/card-setps'
import { LandingFooter } from './footer'
import { LandingHeader } from './landing-header'
import { Reveal } from './reveal'
import { ScrollZoomImage } from './scroll-zoom-image'
import { SectionAreYouReady } from './section/section-are-you-ready'
import { SectionAtmosphere } from './section/section-atmosphere'
import { SectionClarity } from './section/section-clarity'
import { SectionHero } from './section/section-hero'
import { SectionPulse } from './section/section-pulse'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'
const SECTION_Y = 'py-[clamp(4rem,10vw,7.5rem)]'
const HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance'

export function LandingPage() {
  const { t } = useTranslation('landing')
  const { isAuthenticated, isLoading } = useSession()
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null
  const showAuthChrome = isAuthenticated || (isLoading && hasToken)
  const showAuthCtas = !showAuthChrome

  return (
    <div className="bg-background text-on-surface">
      <a
        href="#contenido"
        className="absolute top-4 left-4 z-50 -translate-y-16 rounded-control bg-primary px-4 py-2.5 font-sans text-sm font-medium text-on-primary transition-transform duration-(--duration-fast) ease-emphasized focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink motion-reduce:transition-none"
      >
        {t('skipToContent')}
      </a>

      <LandingHeader />

      <main id="contenido">
        <SectionHero showAuthCtas={showAuthCtas}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={WEB_ROUTES.register()} variant="default" size="lg" className="min-h-11">
              {t('hero.ctaPrimary')}
            </Link>
            <Link
              to={WEB_ROUTES.login()}
              variant="outline"
              size="lg"
              className="min-h-11 border-white/20 bg-transparent hover:bg-white/10"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </SectionHero>

        <section
          aria-labelledby="about-heading"
          className="relative overflow-hidden border-t border-hairline/40"
        >
          <div className={cn(SHELL, SECTION_Y, 'grid gap-12 lg:grid-cols-12 lg:gap-16')}>
            <Reveal className="lg:col-span-5">
              <h2 id="about-heading" className={HEADING}>
                {t('about.headline')}
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-[52ch] text-lg leading-relaxed text-pretty text-on-surface-variant">
                {t('about.body')}
              </p>
            </Reveal>
          </div>

          <div className="relative aspect-21/9 sm:aspect-[2.4/1]">
            <ScrollZoomImage
              src={LANDING_IMAGES.about.src}
              srcSet={LANDING_IMAGES.about.srcSet}
              sizes="100vw"
              width={1600}
              height={900}
              alt={t('about.imageAlt')}
              containerClassName="absolute inset-0"
              className="h-full w-full object-cover"
              maxScale={1.3}
              loading="lazy"
              decoding="async"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/60"
            />
          </div>
        </section>

        <SectionAtmosphere />

        <section
          id="como-funciona"
          aria-labelledby="how-heading"
          className={cn(SHELL, SECTION_Y, 'scroll-mt-20')}
        >
          <Reveal>
            <h2 id="how-heading" className={HEADING}>
              {t('how.headline')}
            </h2>
            <CardSteps />
          </Reveal>
        </section>

        <SectionClarity />

        <SectionPulse />

        <section
          id="eventos"
          aria-labelledby="events-heading"
          className="scroll-mt-20 border-t border-hairline/40 bg-surface-container-lowest"
        >
          <div className={cn(SHELL, SECTION_Y)}>
            <Reveal className="max-w-2xl">
              <h2 id="events-heading" className={HEADING}>
                {t('events.headline')}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('events.support')}
              </p>
            </Reveal>

            <ul className="mt-14 divide-y divide-hairline/45 border-t border-hairline/45">
              {LANDING_IMAGES.events.map((event, index) => (
                <li
                  key={event.key}
                  className={cn(
                    'group grid md:items-stretch',
                    index % 2 === 0
                      ? 'md:grid-cols-[1.15fr_0.85fr]'
                      : 'md:grid-cols-[0.85fr_1.15fr]'
                  )}
                >
                  <div
                    className={cn(
                      'relative aspect-16/10 overflow-hidden sm:aspect-auto sm:min-h-64',
                      index % 2 === 1 && 'md:order-2'
                    )}
                  >
                    <img
                      src={event.src}
                      srcSet={event.srcSet}
                      sizes="(min-width: 768px) 55vw, 100vw"
                      width={1400}
                      height={900}
                      alt={t(`events.items.${event.key}.imageAlt`)}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div
                    className={cn(
                      'flex flex-col justify-center px-0 py-8 sm:py-10 md:px-8 lg:px-10',
                      index % 2 === 1 && 'md:order-1'
                    )}
                  >
                    <p className="font-label text-sm tracking-label-sm text-on-surface-variant">
                      {t(`events.items.${event.key}.date`)}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                      {t(`events.items.${event.key}.title`)}
                    </h3>
                    <p className="mt-2 text-base text-on-surface-variant">
                      {t(`events.items.${event.key}.venue`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SectionAreYouReady showAuthCtas={showAuthCtas} />
      </main>

      <LandingFooter />
    </div>
  )
}
