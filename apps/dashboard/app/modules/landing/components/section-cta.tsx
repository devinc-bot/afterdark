import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export function SectionCta() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section aria-labelledby="cta-heading" className="border-b border-hairline/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-margin-mobile py-[clamp(4rem,9vw,7rem)] text-center md:px-margin-desktop">
        <h2
          id="cta-heading"
          className="max-w-[20ch] font-display text-[clamp(1.875rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-balance text-on-surface"
        >
          {t('closing.headline')}
        </h2>
        <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
          {t('closing.support')}
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to={DASHBOARD_ROUTES.register()}>{t('closing.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
