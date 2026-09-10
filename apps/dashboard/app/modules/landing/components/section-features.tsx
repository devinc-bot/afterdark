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
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:grid-cols-12 md:gap-16 md:px-margin-desktop">
        <div className="md:col-span-4">
          <h2
            id="features-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] -tracking-label-md text-balance text-on-surface"
          >
            {t('features.headline')}
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('features.support')}
          </p>
        </div>

        <ul className="flex list-none flex-col gap-0 p-0 md:col-span-8">
          {LANDING_FEATURES.map(({ key, icon: Icon }, index) => (
            <li
              key={key}
              className="border-t border-hairline/50 py-7 first:border-t-0 first:pt-0 last:pb-0"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-3">
                <span className="self-center font-label text-sm tabular-nums tracking-label-sm text-on-surface-variant">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className="size-7 shrink-0 text-on-surface-variant"
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                    aria-hidden
                  />
                  <h3 className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                    {t(`features.items.${key}.title`)}
                  </h3>
                </div>
                <p className="col-start-2 max-w-[48ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                  {t(`features.items.${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
