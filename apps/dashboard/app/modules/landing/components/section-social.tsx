import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@repo/ui'
import { LANDING_SOCIAL_KEYS } from '../constants/landing-content'

export function SectionSocial() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section aria-labelledby="social-heading" className="border-b border-hairline/60">
      <div className="mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4rem,8vw,6rem)] md:px-margin-desktop">
        <div className="max-w-2xl">
          <p className="font-label text-sm font-medium tracking-label-sm text-primary uppercase">
            {t('social.eyebrow')}
          </p>
          <h2
            id="social-heading"
            className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('social.headline')}
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {LANDING_SOCIAL_KEYS.map((key) => (
            <li key={key}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
                  <blockquote className="text-base leading-relaxed text-pretty text-on-surface">
                    “{t(`social.items.${key}.quote`)}”
                  </blockquote>
                  <footer className="font-label text-sm tracking-label-sm text-on-surface-variant">
                    {t(`social.items.${key}.author`)}
                  </footer>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
