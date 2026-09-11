import { useTranslation } from 'react-i18next'
import { usePageTitle, cn } from '@repo/ui'
import { useEffect } from 'react'
import { LandingHeader } from './landing-header'
import { SectionHero } from './section-hero'
import { SectionDemo } from './section-demo'
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
    <div className="min-h-dvh bg-background text-on-surface selection:bg-primary selection:text-on-primary">
      <a
        href="#contenido"
        className={cn(
          'absolute top-4 left-4 z-50 -translate-y-16 rounded-full bg-on-surface px-4 py-2.5 font-label text-sm font-medium text-background transition-transform duration-(--duration-fast) ease-emphasized focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none'
        )}
      >
        {t('skipToContent')}
      </a>

      <LandingHeader />

      <main id="contenido" className="w-full bg-background">
        <div className="flex w-full flex-col bg-surface-dim text-on-surface">
          <SectionHero />
          <Reveal>
            <SectionDemo />
          </Reveal>
          <SectionFeatures />
          <SectionHow />
          <SectionAudiences />
          <SectionValue />
          <SectionSocial />
          <SectionFaq />
          <Reveal>
            <SectionCta />
          </Reveal>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
