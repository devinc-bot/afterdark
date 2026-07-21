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
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-margin-mobile py-[clamp(4rem,8vw,6rem)] md:grid-cols-2 md:gap-16 md:px-margin-desktop">
        <div>
          <p className="font-label text-sm font-medium tracking-label-sm text-primary uppercase">
            {t('audiences.eyebrow')}
          </p>
          <h2
            id="audiences-heading"
            className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('audiences.headline')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-on-surface-variant">
            {t('audiences.support')}
          </p>

          <ul className="mt-10 flex flex-col gap-6">
            {LANDING_AUDIENCE_KEYS.map((key) => (
              <li key={key} className="border-l-2 border-hairline-strong pl-4">
                <h3 className="font-heading text-lg font-semibold text-on-surface">
                  {t(`audiences.items.${key}.title`)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  {t(`audiences.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-hairline/60 md:order-last">
          <img
            src={LANDING_IMAGES.audiences.src}
            srcSet={LANDING_IMAGES.audiences.srcSet}
            sizes="(min-width: 768px) 50vw, 100vw"
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
