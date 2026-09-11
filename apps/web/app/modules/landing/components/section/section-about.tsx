import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { LANDING_IMAGES } from '../../constants/images'
import { LANDING_HEADING } from '../../constants/layout'
import { Reveal } from '../reveal'

const ABOUT_METRIC_KEYS = ['1', '2', '3'] as const

type SectionAboutProps = {
  className?: string
}

export function SectionAbout({ className }: SectionAboutProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="about-heading"
      className={cn('relative z-20 -mt-12 sm:-mt-16', className)}
    >
      <Container>
        <Reveal>
          <div
            className={cn(
              'rounded-app-xl bg-surface-container/80 glass-panel',
              'backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-surface-container/70',
              'motion-reduce:backdrop-blur-none motion-reduce:bg-surface-container',
              'p-4'
            )}
          >
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="flex flex-col justify-between gap-8 lg:col-span-5 p-6">
                <div className="space-y-3">
                  <span className="flex items-center gap-2 font-label text-xs font-semibold tracking-wider text-primary uppercase">
                    <span className="h-0.5 w-2 bg-primary" aria-hidden />
                    {t('about.kicker')}
                  </span>
                  <h2 id="about-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
                    {t('about.headline')}
                  </h2>
                </div>
                <p className="max-w-[42ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
                  {t('about.body')}
                </p>
                <div className="grid grid-cols-3 gap-3 border-t border-outline-variant/30 pt-5">
                  {ABOUT_METRIC_KEYS.map((key, index) => (
                    <div key={key}>
                      <div
                        className={cn(
                          'font-display text-xl font-bold sm:text-2xl',
                          index === ABOUT_METRIC_KEYS.length - 1
                            ? 'text-primary'
                            : 'text-on-surface'
                        )}
                      >
                        {t(`about.metrics.${key}.value`)}
                      </div>
                      <div className="font-label text-xs text-on-surface-variant">
                        {t(`about.metrics.${key}.label`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center lg:col-span-7">
                <div className="group relative h-90 w-full overflow-hidden rounded-app-lg border border-outline-variant/20 bg-surface-container-low sm:h-110">
                  <img
                    src={LANDING_IMAGES.about.src}
                    srcSet={LANDING_IMAGES.about.srcSet}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    width={1400}
                    height={1050}
                    alt={t('about.imageAlt')}
                    className="h-full w-full object-cover grayscale-20 transition-transform duration-700 ease-out motion-safe:group-hover:scale-105 motion-reduce:transition-none"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface-container-lowest/40 via-surface-container-lowest/30 to-transparent"
                    aria-hidden
                  />

                  <div
                    className={cn(
                      'absolute right-5 bottom-5 left-5 space-y-3 rounded-app p-4 sm:left-auto sm:w-80',
                      'bg-surface-container-highest/80 shadow-(--shadow-glass) backdrop-blur-md backdrop-saturate-150',
                      'supports-backdrop-filter:bg-surface-container-highest/70',
                      'motion-reduce:backdrop-blur-none motion-reduce:bg-surface-container-highest'
                    )}
                    aria-hidden
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
                      <span className="font-label text-xs font-semibold tracking-wider text-primary uppercase">
                        {t('about.ticket.status')}
                      </span>
                      <span className="font-label text-xs text-on-surface-variant">
                        {t('about.ticket.code')}
                      </span>
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-on-surface">
                        {t('about.ticket.eventName')}
                      </div>
                      <div className="text-sm text-on-surface-variant">
                        {t('about.ticket.datetime')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-app-sm bg-surface-container-lowest/60 p-2.5 font-label text-xs">
                      <span className="text-on-surface">{t('about.ticket.capacity')}</span>
                      <span className="font-semibold text-primary">{t('about.ticket.gate')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
