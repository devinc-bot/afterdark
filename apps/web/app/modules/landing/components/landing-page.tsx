import { useEffect } from 'react'
import { Link, Skeleton, VT, cn, vtStyle } from '@repo/ui'
import { useTranslation } from 'react-i18next'
import { LandingHeader } from '~/modules/common/components/landing-header'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import {
  LANDING_CTA_GHOST_ON_MEDIA,
  LANDING_CTA_PRIMARY,
  LANDING_FOCUS_RING,
  LANDING_FOCUS_RING_ON_MEDIA,
  LANDING_HEADING,
  LANDING_SECTION_Y,
} from '../constants/layout'
import { scrollToSectionFromLocationHash } from '../utils/scroll-to-section.utils'
import { HowSteps } from './how-steps'
import { LandingFooter } from './footer'
import { Reveal } from './reveal'
import { SectionAbout } from './section/section-about'
import { SectionAreYouReady } from './section/section-are-you-ready'
import { SectionClarity } from './section/section-clarity'
import { SectionEvents } from './section/section-events'
import { SectionHero } from './section/section-hero'
import { SectionOrganizers } from './section/section-organizers'
import { Container } from '~/modules/common/components/container'

export function LandingPage() {
  const { t } = useTranslation('landing')
  const { isAuthenticated, isLoading } = useSession()
  const showAuthCtas = !isLoading && !isAuthenticated

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

      <main id="contenido" style={vtStyle(VT.mainContent)}>
        <SectionHero showAuthCtas={showAuthCtas || isLoading}>
          {isLoading ? (
            <div
              className="mt-8 flex flex-wrap items-center gap-3"
              aria-busy="true"
              aria-label={t('hero.ctaLoading')}
            >
              <Skeleton className="h-11 w-40 rounded-md bg-white/25" />
              <Skeleton className="h-11 w-28 rounded-md bg-white/15" />
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={WEB_ROUTES.register()}
                size="lg"
                className={cn('px-8', LANDING_CTA_PRIMARY, LANDING_FOCUS_RING_ON_MEDIA)}
              >
                {t('hero.ctaPrimary')}
              </Link>
              <Link
                to={WEB_ROUTES.login()}
                variant="outline"
                size="lg"
                className={cn(LANDING_CTA_GHOST_ON_MEDIA, LANDING_FOCUS_RING_ON_MEDIA)}
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          )}
        </SectionHero>

        <SectionAbout />

        <Container
          as="section"
          id="como-funciona"
          aria-labelledby="how-heading"
          className={cn(LANDING_SECTION_Y, 'scroll-mt-24')}
        >
          <Reveal>
            <h2 id="how-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
              {t('how.headline')}
            </h2>
            <HowSteps />
          </Reveal>
        </Container>

        <SectionClarity />

        <SectionEvents showAuthCtas={showAuthCtas} />

        <SectionAreYouReady showAuthCtas={showAuthCtas} />

        <SectionOrganizers />
      </main>

      <LandingFooter />
    </div>
  )
}
