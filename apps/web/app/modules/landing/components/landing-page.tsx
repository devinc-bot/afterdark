import { useEffect } from 'react'
import { getCookieSync } from '@repo/common'
import { Link, cn } from '@repo/ui'
import { useTranslation } from 'react-i18next'
import { Container } from '~/modules/common/components/container'
import { COOKIE_KEYS } from '~/modules/common/constants/cookies'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { LANDING_IMAGES } from '../constants/images'
import {
  LANDING_CTA_GHOST_ON_MEDIA,
  LANDING_CTA_PRIMARY,
  LANDING_FOCUS_RING,
  LANDING_HEADING,
  LANDING_SECTION_Y,
} from '../constants/layout'
import { scrollToSectionFromLocationHash } from '../utils/scroll-to-section.utils'
import { HowSteps } from './how-steps'
import { LandingFooter } from './footer'
import { LandingHeader } from './landing-header'
import { Reveal } from './reveal'
import { ScrollZoomImage } from './scroll-zoom-image'
import { SectionAreYouReady } from './section/section-are-you-ready'
import { SectionAtmosphere } from './section/section-atmosphere'
import { SectionClarity } from './section/section-clarity'
import { SectionHero } from './section/section-hero'
import { SectionOrganizers } from './section/section-organizers'
import { SectionPulse } from './section/section-pulse'

export function LandingPage() {
  const { t } = useTranslation('landing')
  const { isAuthenticated, isLoading } = useSession()
  const hasToken = getCookieSync({ name: COOKIE_KEYS.accessToken }) !== null
  const showAuthChrome = isAuthenticated || (isLoading && hasToken)
  const showAuthCtas = !showAuthChrome

  useEffect(() => {
    scrollToSectionFromLocationHash()
  }, [])

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <a
        href="#contenido"
        className={cn(
          'absolute top-4 left-4 z-50 -translate-y-16 rounded-lg bg-on-surface px-4 py-2.5 font-label text-sm font-medium text-background transition-transform duration-(--duration-fast) ease-emphasized focus:translate-y-0 motion-reduce:transition-none',
          LANDING_FOCUS_RING
        )}
      >
        {t('skipToContent')}
      </a>

      <LandingHeader />

      <main id="contenido">
        <SectionHero showAuthCtas={showAuthCtas}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={WEB_ROUTES.register()} size="lg" className={cn('px-8', LANDING_CTA_PRIMARY)}>
              {t('hero.ctaPrimary')}
            </Link>
            <Link
              to={WEB_ROUTES.login()}
              variant="outline"
              size="lg"
              className={LANDING_CTA_GHOST_ON_MEDIA}
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </SectionHero>

        <section
          aria-labelledby="about-heading"
          className="relative overflow-hidden border-t border-hairline/40"
        >
          <Container className={cn(LANDING_SECTION_Y, 'grid gap-12 lg:grid-cols-12 lg:gap-16')}>
            <Reveal className="lg:col-span-5">
              <h2 id="about-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
                {t('about.headline')}
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-[52ch] text-lg leading-relaxed text-pretty text-on-surface-variant">
                {t('about.body')}
              </p>
            </Reveal>
          </Container>

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

        <Container
          as="section"
          id="como-funciona"
          aria-labelledby="how-heading"
          className={cn(LANDING_SECTION_Y, 'scroll-mt-24 border-t border-hairline/40')}
        >
          <Reveal>
            <h2 id="how-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
              {t('how.headline')}
            </h2>
            <HowSteps />
          </Reveal>
        </Container>

        <SectionClarity />

        <SectionPulse />

        <section
          id="eventos"
          aria-labelledby="events-heading"
          className="scroll-mt-24 border-t border-hairline/40"
        >
          <Container className={LANDING_SECTION_Y}>
            <Reveal className="mx-auto max-w-2xl min-w-0 text-center">
              <h2 id="events-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
                {t('events.headline')}
              </h2>
              <p className="mx-auto mt-4 max-w-[42ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('events.support')}
              </p>
              {showAuthCtas ? (
                <Link
                  to={WEB_ROUTES.register()}
                  size="lg"
                  className={cn('mt-8 px-8', LANDING_CTA_PRIMARY)}
                >
                  {t('events.cta')}
                </Link>
              ) : null}
            </Reveal>

            <ul
              aria-label={t('events.previewAria')}
              className="mt-14 grid list-none gap-3 p-0 sm:grid-cols-3 sm:gap-4"
            >
              {LANDING_IMAGES.events.map((event) => (
                <li key={event.key} className="min-w-0">
                  <div className="overflow-hidden rounded-xl border border-hairline/40 bg-surface-container-lowest">
                    <img
                      src={event.src}
                      srcSet={event.srcSet}
                      sizes="(min-width: 640px) 33vw, 100vw"
                      width={900}
                      height={1200}
                      alt={t(`events.items.${event.key}.imageAlt`)}
                      className="aspect-3/4 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <SectionAreYouReady showAuthCtas={showAuthCtas} />

        <SectionOrganizers />
      </main>

      <LandingFooter />
    </div>
  )
}
