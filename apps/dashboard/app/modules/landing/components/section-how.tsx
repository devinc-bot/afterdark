import type { LucideIcon } from 'lucide-react'
import { MapPin, CalendarCheck, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANDING_STEP_KEYS } from '../constants/landing-content'

const STEP_ICONS = {
  '1': MapPin,
  '2': CalendarCheck,
  '3': Ticket,
} as const satisfies Record<(typeof LANDING_STEP_KEYS)[number], LucideIcon>

export function SectionHow() {
  const { t } = useTranslation('dashboardLanding')

  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="scroll-mt-20 border-b border-hairline/60 bg-surface-container-lowest"
    >
      <div className="mx-auto w-full max-w-6xl px-margin-mobile py-[clamp(4rem,8vw,6.5rem)] md:px-margin-desktop">
        <div className="max-w-2xl">
          <h2
            id="how-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('how.headline')}
          </h2>
        </div>

        <ol className="mt-14 grid list-none gap-0 border-t border-hairline/50 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-hairline/50">
          {LANDING_STEP_KEYS.map((key, index) => {
            const Icon = STEP_ICONS[key]
            return (
              <li
                key={key}
                className="min-w-0 border-b border-hairline/50 py-10 last:border-b-0 lg:border-b-0 lg:px-8 lg:pt-10 lg:first:pl-0 lg:last:pr-0"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span className="font-label text-sm tabular-nums tracking-label-sm text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Icon
                      className="size-7 text-on-surface-variant"
                      strokeWidth={1.5}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                      {t(`how.steps.${key}.title`)}
                    </h3>
                    <p className="max-w-[36ch] text-base leading-relaxed text-pretty text-on-surface-variant">
                      {t(`how.steps.${key}.body`)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
