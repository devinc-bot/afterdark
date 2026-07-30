import { useTranslation } from 'react-i18next'
import { LANDING_VALUE_KEYS } from '../constants/landing-content'
import { LANDING_IMAGES } from '../constants/images'

export function SectionValue() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="value"
      aria-labelledby="value-heading"
      className="scroll-mt-20 border-b border-hairline/60 bg-surface-container-lowest"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:grid-cols-2 md:gap-16 md:px-margin-desktop">
        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-surface-container-low">
          <img
            src={LANDING_IMAGES.value.src}
            srcSet={LANDING_IMAGES.value.srcSet}
            sizes="(min-width: 768px) 50vw, 100vw"
            width={1400}
            height={1050}
            alt={t('value.imageAlt')}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h2
            id="value-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('value.headline')}
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('value.support')}
          </p>

          <ul className="mt-10 flex list-none flex-col gap-0 p-0">
            {LANDING_VALUE_KEYS.map((key) => (
              <li
                key={key}
                className="border-t border-hairline/50 py-5 first:border-t-0 first:pt-0"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">
                  {t(`value.items.${key}.title`)}
                </h3>
                <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-pretty text-on-surface-variant sm:text-base">
                  {t(`value.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
