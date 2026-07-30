import { useTranslation } from 'react-i18next'
import { LANDING_SOCIAL_KEYS } from '../constants/landing-content'

export function SectionSocial() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section aria-labelledby="social-heading" className="border-b border-hairline/60">
      <div className="mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:px-margin-desktop">
        <div className="max-w-2xl">
          <h2
            id="social-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('social.headline')}
          </h2>
        </div>

        <ul className="mt-14 grid list-none gap-0 border-t border-hairline/50 p-0 md:grid-cols-3 md:divide-x md:divide-hairline/50">
          {LANDING_SOCIAL_KEYS.map((key) => (
            <li
              key={key}
              className="flex flex-col justify-between gap-8 border-b border-hairline/50 py-10 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <blockquote className="text-base leading-relaxed text-pretty text-on-surface sm:text-lg">
                “{t(`social.items.${key}.quote`)}”
              </blockquote>
              <footer className="font-label text-sm text-on-surface-variant">
                {t(`social.items.${key}.author`)}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
