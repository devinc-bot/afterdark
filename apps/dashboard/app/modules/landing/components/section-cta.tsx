import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export function SectionCta() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-b border-hairline/60"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklch,var(--color-primary)_14%,transparent)_0%,transparent_55%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start px-margin-mobile py-[clamp(4.5rem,10vw,7.5rem)] md:px-margin-desktop sm:items-center sm:text-center">
        <h2
          id="cta-heading"
          className="max-w-[18ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-balance text-on-surface"
        >
          {t('closing.headline')}
        </h2>
        <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
          {t('closing.support')}
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="px-8">
            <Link to={DASHBOARD_ROUTES.register()}>{t('closing.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
