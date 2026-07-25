import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Info, MapPin, X } from 'lucide-react'
import { Button } from '@repo/ui'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'
import {
  readOnboardingAlertDismissed,
  saveOnboardingAlertDismissed,
} from '~/modules/owner/utils/onboarding-alert.storage'

const ONBOARDING_STEPS = ['location', 'event', 'ticket'] as const

export function OnboardingFlowAlert() {
  const { t } = useTranslation('dashboard')
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(readOnboardingAlertDismissed())
    setReady(true)
  }, [])

  if (!ready || dismissed) return null

  const handleDismiss = () => {
    saveOnboardingAlertDismissed()
    setDismissed(true)
  }

  return (
    <section
      aria-labelledby="onboarding-flow-title"
      className="rounded-lg border border-primary/35 bg-primary/8 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4">
        <header className="flex justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex p-1 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Info className="size-8" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 max-w-prose">
              <h2
                id="onboarding-flow-title"
                className="text-balance text-sm font-semibold leading-snug text-ink"
              >
                {t('pages.panel.onboarding.title')}
              </h2>
              <p className="mt-1 text-pretty text-sm leading-relaxed text-on-surface-variant">
                {t('pages.panel.onboarding.description')}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-1 -mt-1 shrink-0 text-ink-muted hover:text-ink"
            onClick={handleDismiss}
            aria-label={t('pages.panel.onboarding.dismiss')}
          >
            <X aria-hidden="true" />
          </Button>
        </header>

        <ol className="flex flex-col border-t border-primary/20 pt-4">
          {ONBOARDING_STEPS.map((key, index) => {
            const isLast = index === ONBOARDING_STEPS.length - 1

            return (
              <li key={key} className="flex items-stretch gap-6">
                <div className="flex shrink-0 flex-col items-center" aria-hidden="true">
                  <span className="flex p-1 aspect-square items-center justify-center rounded-full bg-primary/20 text-md font-semibold tabular-nums text-primary">
                    {index + 1}
                  </span>
                  {isLast ? null : <span className="mt-1 w-px flex-1 bg-primary/25" />}
                </div>
                <div className={isLast ? 'min-w-0 max-w-prose' : 'min-w-0 max-w-prose pb-4'}>
                  <p className="text-sm font-medium leading-snug text-ink">
                    <span className="sr-only">{`${index + 1}. `}</span>
                    {t(`pages.panel.onboarding.steps.${key}.title`)}
                  </p>
                  <p className="mt-0.5 text-pretty text-sm leading-relaxed text-on-surface-variant">
                    {t(`pages.panel.onboarding.steps.${key}.description`)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-3 border-t border-primary/20 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-pretty text-sm leading-relaxed text-on-surface-variant sm:max-w-sm">
            {t('pages.panel.onboarding.ctaHint')}
          </p>
          <Button
            asChild
            className="w-full shrink-0 sm:w-auto"
            iconLeft={<MapPin aria-hidden="true" />}
          >
            <Link to={DASHBOARD_ROUTES.locationsNew()}>{t('pages.panel.onboarding.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
