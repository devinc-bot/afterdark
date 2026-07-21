import { useTranslation } from 'react-i18next'
import { LANDING_STEP_KEYS } from '../constants/landing-content'

export function SectionHow() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="scroll-mt-20 border-b border-hairline/60 bg-surface-container-lowest"
    >
      <div className="mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4rem,8vw,6rem)] md:px-margin-desktop">
        <div className="max-w-2xl">
          <p className="font-label text-sm font-medium tracking-label-sm text-primary uppercase">
            {t('how.eyebrow')}
          </p>
          <h2
            id="how-heading"
            className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('how.headline')}
          </h2>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {LANDING_STEP_KEYS.map((key, index) => (
            <li key={key} className="flex flex-col gap-4">
              <span className="inline-flex size-10 items-center justify-center rounded-full border border-hairline-strong font-heading text-base font-semibold text-on-surface">
                {index + 1}
              </span>
              <h3 className="font-heading text-lg font-semibold text-on-surface">
                {t(`how.steps.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {t(`how.steps.${key}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
