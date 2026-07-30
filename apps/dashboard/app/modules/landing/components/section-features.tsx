import { useTranslation } from 'react-i18next'
import { LANDING_FEATURES } from '../constants/landing-content'

export function SectionFeatures() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-20 border-b border-hairline/60"
    >
      <div className="mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:px-margin-desktop">
        <div className="max-w-2xl">
          <h2
            id="features-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('features.headline')}
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('features.support')}
          </p>
        </div>

        <ul className="mt-14 grid list-none gap-0 border-t border-hairline/50 p-0 sm:grid-cols-2">
          {LANDING_FEATURES.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="min-w-0 border-b border-hairline/50 py-10 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8 lg:py-12"
            >
              <div className="flex flex-col gap-5">
                <Icon
                  className="size-8 text-on-surface-variant"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  aria-hidden
                />
                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                    {t(`features.items.${key}.title`)}
                  </h3>
                  <p className="max-w-[36ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                    {t(`features.items.${key}.body`)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
