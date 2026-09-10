import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { LANDING_IMAGES } from '../../constants/images'
import {
  LANDING_CTA_PRIMARY,
  LANDING_HEADING,
  LANDING_SECTION_Y,
} from '../../constants/layout'
import { Reveal } from '../reveal'

const EVENT_KEYS = LANDING_IMAGES.events.map((event) => event.key)

type SectionEventsProps = {
  showAuthCtas?: boolean
  className?: string
}

export function SectionEvents({ showAuthCtas = true, className }: SectionEventsProps) {
  const { t } = useTranslation('landing')
  const [selectedKey, setSelectedKey] = useState<(typeof EVENT_KEYS)[number]>('1')
  const selected = LANDING_IMAGES.events.find((event) => event.key === selectedKey) ?? LANDING_IMAGES.events[0]

  return (
    <section
      id="eventos"
      aria-labelledby="events-heading"
      className={cn('scroll-mt-24 border-t border-hairline/40', className)}
    >
      <Container className={LANDING_SECTION_Y}>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start">
            <div className="lg:col-span-4">
              <h2 id="events-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
                {t('events.headline')}
              </h2>
              <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                {t('events.support')}
              </p>
              {showAuthCtas ? (
                <Link to={WEB_ROUTES.register()} size="lg" className={cn('mt-8 px-8', LANDING_CTA_PRIMARY)}>
                  {t('events.cta')}
                </Link>
              ) : null}

              <ul
                aria-label={t('events.previewAria')}
                className="mt-10 flex list-none flex-col gap-0 border-t border-hairline/50 p-0"
              >
                {LANDING_IMAGES.events.map((event) => {
                  const selectedItem = event.key === selectedKey
                  return (
                    <li key={event.key}>
                      <button
                        type="button"
                        aria-pressed={selectedItem}
                        onClick={() => setSelectedKey(event.key)}
                        className={cn(
                          'flex w-full items-center border-b border-hairline/50 py-4 text-left transition-colors duration-(--duration-fast) ease-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          selectedItem
                            ? 'text-on-surface'
                            : 'text-on-surface-variant hover:text-on-surface'
                        )}
                      >
                        <span
                          className={cn(
                            'font-display text-lg font-semibold tracking-tight',
                            selectedItem && 'underline decoration-primary decoration-2 underline-offset-8'
                          )}
                        >
                          {t(`events.items.${event.key}.title`)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-app bg-surface-container-low ring-1 ring-hairline/40 lg:col-span-8">
              <div className="aspect-16/10">
                <img
                  key={selected.key}
                  src={selected.src}
                  srcSet={selected.srcSet}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  width={1400}
                  height={875}
                  alt={t(`events.items.${selected.key}.imageAlt`)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div
                aria-live="polite"
                className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/45 to-transparent p-6 pt-16 sm:p-8 sm:pt-20"
              >
                <p className="max-w-[36ch] font-display text-xl font-semibold tracking-tight text-balance text-white">
                  {t(`events.items.${selected.key}.title`)}
                </p>
                <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-pretty text-white/80 sm:text-base">
                  {t(`events.items.${selected.key}.blurb`)}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
