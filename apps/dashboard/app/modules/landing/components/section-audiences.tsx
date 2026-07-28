import { useTranslation } from 'react-i18next'
import { LANDING_AUDIENCE_KEYS } from '../constants/landing-content'
import { LANDING_IMAGES } from '../constants/images'

export function SectionAudiences() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="audiences"
      aria-labelledby="audiences-heading"
      className="scroll-mt-20 border-b border-hairline/60"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:grid-cols-2 md:gap-16 md:px-margin-desktop">
        <div>
          <h2
            id="audiences-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('audiences.headline')}
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('audiences.support')}
          </p>

          <ul className="mt-10 flex list-none flex-col gap-0 p-0">
            {LANDING_AUDIENCE_KEYS.map((key) => (
              <li
                key={key}
                className="border-t border-hairline/50 py-5 first:border-t-0 first:pt-0"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">
                  {t(`audiences.items.${key}.title`)}
                </h3>
                <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-pretty text-on-surface-variant sm:text-base">
                  {t(`audiences.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-surface-container-low md:order-last">
          <img
            src={LANDING_IMAGES.audiences.src}
            srcSet={LANDING_IMAGES.audiences.srcSet}
            sizes="(min-width: 768px) 50vw, 100vw"
            width={1400}
            height={1050}
            alt={t('audiences.imageAlt')}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
