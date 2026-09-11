import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Button } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import {
  LANDING_CTA_PRIMARY,
  LANDING_EYEBROW,
  LANDING_HEADING,
  LANDING_ICON,
  LANDING_MAX,
} from '../constants/layout'

const MICRO_KEYS = ['1', '2'] as const

export function SectionCta() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden">
      <div className={`${LANDING_MAX} pt-10 pb-28`}>
        <div className="relative overflow-hidden rounded-app-xl bg-surface-container-low p-10 text-center shadow-glass md:p-20">
          <div
            className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            <span className={LANDING_EYEBROW}>{t('closing.eyebrow')}</span>
            <h2
              id="cta-heading"
              className={`${LANDING_HEADING} mx-auto max-w-[20ch] text-[clamp(1.875rem,4vw,3.5rem)]`}
            >
              {t('closing.headline')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-pretty text-on-surface-variant">
              {t('closing.support')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className={LANDING_CTA_PRIMARY}>
                <Link to={DASHBOARD_ROUTES.register()}>{t('closing.cta')}</Link>
              </Button>
            </div>
            <ul className="flex list-none flex-wrap items-center justify-center gap-6 pt-4 font-label text-xs text-on-surface-variant">
              {MICRO_KEYS.map((key) => (
                <li key={key} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className={`${LANDING_ICON} text-primary`} aria-hidden />
                  {t(`closing.micro.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
