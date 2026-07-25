import { useTranslation } from 'react-i18next'
import { cn } from '@repo/ui'
import { LANDING_IMAGES } from '../../constants/images'
import { LANDING_HEADING, LANDING_SECTION_Y, LANDING_SHELL } from '../../constants/layout'
import { Reveal } from '../reveal'

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
      <div
        className={cn(
          LANDING_SHELL,
          LANDING_SECTION_Y,
          'grid items-center gap-12 lg:grid-cols-12 lg:gap-16'
        )}
      >
        <Reveal className="lg:col-span-5">
          <h2 id="pulse-heading" className={cn(LANDING_HEADING, 'text-on-surface')}>
            {t('pulse.headline')}
          </h2>
          <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('pulse.body')}
          </p>
          <ul className="mt-10 flex max-w-md flex-col gap-0 border-t border-hairline/50">
            <li className="border-b border-hairline/50 py-5">
              <p className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                {t('pulse.stats.nights.value')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                {t('pulse.stats.nights.label')}
              </p>
            </li>
            <li className="py-5">
              <p className="font-display text-xl font-semibold tracking-tight text-balance text-on-surface">
                {t('pulse.stats.focus.value')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                {t('pulse.stats.focus.label')}
              </p>
            </li>
          </ul>
        </Reveal>

        <Reveal className="relative aspect-4/5 overflow-hidden lg:col-span-6 lg:col-start-7">
          <img
            src={LANDING_IMAGES.clarity.src}
            srcSet={LANDING_IMAGES.clarity.srcSet}
            sizes="(min-width: 1024px) 42vw, 100vw"
            width={1400}
            height={1750}
            alt={t('pulse.imageAlt')}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent"
          />
        </Reveal>
      </div>
    </section>
  )
}
