import { usePageTitle } from '@repo/ui'
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

export function LandingPage() {
  usePageTitle('dashboardLanding', 'metaTitle')

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <LandingHeader />
      <main>
        <SectionHero />
        <SectionFeatures />
        <SectionHow />
        <SectionAudiences />
        <SectionValue />
        <SectionSocial />
        <SectionFaq />
        <SectionCta />
      </main>
      <LandingFooter />
    </div>
  )
}
