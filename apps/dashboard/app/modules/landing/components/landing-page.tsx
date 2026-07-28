import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTitle, cn } from '@repo/ui'
import { LandingHeader } from './landing-header'
import { SectionHero } from './section-hero'
import { SectionFeatures } from './section-features'
import { SectionHow } from './section-how'
import { SectionAudiences } from './section-audiences'
import { SectionValue } from './section-value'
import { SectionSocial } from './section-social'
import { SectionFaq } from './section-faq'
import { SectionCta } from './section-cta'
import { LandingFooter } from './landing-footer'
import { Reveal } from './reveal'
import { scrollToSection } from '../utils/scroll-to-section.utils'

export function LandingPage() {
  const { t } = useTranslation('dashboardLanding')
  usePageTitle('dashboardLanding', 'metaTitle')

  useEffect(() => {
    const hash = window.location.hash
    if (hash) scrollToSection(hash)
  }, [])

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <a
        href="#contenido"
        className={cn(
          'absolute top-4 left-4 z-50 -translate-y-16 rounded-lg bg-on-surface px-4 py-2.5 font-label text-sm font-medium text-background transition-transform duration-(--duration-fast) ease-emphasized focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none'
        )}
      >
        {t('skipToContent')}
      </a>

      <LandingHeader />

      <main id="contenido">
        <SectionHero />
        <Reveal>
          <SectionFeatures />
        </Reveal>
        <Reveal>
          <SectionHow />
        </Reveal>
        <Reveal>
          <SectionAudiences />
        </Reveal>
        <Reveal>
          <SectionValue />
        </Reveal>
        <Reveal>
          <SectionSocial />
        </Reveal>
        <Reveal>
          <SectionFaq />
        </Reveal>
        <Reveal>
          <SectionCta />
        </Reveal>
      </main>

      <LandingFooter />
    </div>
  )
}
