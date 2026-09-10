import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export function SectionCta() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-b border-hairline/60 bg-surface-container-lowest"
    >
      <div className="relative mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4.5rem,10vw,7.5rem)] md:px-margin-desktop">
        <div className="flex flex-col items-start gap-6 rounded-app bg-surface-container-low px-margin-mobile py-12 ring-1 ring-hairline/50 sm:items-center sm:px-12 sm:py-16 sm:text-center">
          <h2
            id="cta-heading"
            className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('closing.headline')}
          </h2>
          <p className="max-w-[44ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('closing.support')}
          </p>
          <div className="mt-2">
            <Button asChild size="lg" className="px-8">
              <Link to={DASHBOARD_ROUTES.register()}>{t('closing.cta')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
