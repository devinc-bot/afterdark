import { useTranslation } from 'react-i18next'
import { cn } from '@afterdark/ui'
import { LANDING_IMAGES } from '../../constants/images'
import { Reveal } from '../reveal'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'
const SECTION_Y = 'py-[clamp(4rem,10vw,7.5rem)]'
const HEADING =
  'font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance'

type SectionPulseProps = {
  className?: string
}

export function SectionPulse({ className }: SectionPulseProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="pulse-heading"
      className={cn('border-t border-hairline/40', className)}
    >
      <div className={cn(SHELL, SECTION_Y, 'grid items-center gap-12 lg:grid-cols-12 lg:gap-16')}>
        <Reveal className="lg:col-span-5">
          <p className="font-label text-sm tracking-label-sm text-primary">{t('pulse.eyebrow')}</p>
          <h2 id="pulse-heading" className={cn(HEADING, 'mt-4')}>
            {t('pulse.headline')}
          </h2>
          <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('pulse.body')}
          </p>
          <dl className="mt-10 flex max-w-md flex-col gap-0 divide-y divide-hairline/50 border-t border-hairline/50">
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <dt className="shrink-0 font-label text-sm tracking-label-sm text-on-surface-variant">
                {t('pulse.stats.nights.label')}
              </dt>
              <dd className="font-display text-2xl font-bold leading-snug tracking-tight text-balance text-on-surface sm:text-right sm:text-3xl">
                {t('pulse.stats.nights.value')}
              </dd>
            </div>
            <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <dt className="shrink-0 font-label text-sm tracking-label-sm text-on-surface-variant">
                {t('pulse.stats.focus.label')}
              </dt>
              <dd className="font-display text-2xl font-bold leading-snug tracking-tight text-balance text-on-surface sm:text-right sm:text-3xl">
                {t('pulse.stats.focus.value')}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="group relative aspect-4/5 overflow-hidden rounded-3xl lg:col-span-6 lg:col-start-7">
          <img
            src={LANDING_IMAGES.clarity.src}
            srcSet={LANDING_IMAGES.clarity.srcSet}
            sizes="(min-width: 1024px) 42vw, 100vw"
            width={1400}
            height={1750}
            alt={t('pulse.imageAlt')}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading="lazy"
            decoding="async"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/50 via-transparent to-transparent"
          />
        </Reveal>
      </div>
    </section>
  )
}
