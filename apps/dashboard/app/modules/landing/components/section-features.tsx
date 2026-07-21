import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@afterdark/ui'
import { LANDING_FEATURES } from '../constants/landing-content'

export function SectionFeatures() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-b border-hairline/60"
    >
      <div className="mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4rem,8vw,6rem)] md:px-margin-desktop">
        <div className="max-w-2xl">
          <p className="font-label text-sm font-medium tracking-label-sm text-primary uppercase">
            {t('features.eyebrow')}
          </p>
          <h2
            id="features-heading"
            className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('features.headline')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-on-surface-variant">
            {t('features.support')}
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_FEATURES.map(({ key, icon: Icon }) => (
            <li key={key}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-on-surface">
                    {t(`features.items.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {t(`features.items.${key}.body`)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
