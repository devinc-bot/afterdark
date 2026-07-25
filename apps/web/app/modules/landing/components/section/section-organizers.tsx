import { useTranslation } from 'react-i18next'
import { DASHBOARD_URL } from '@repo/common'
import { cn } from '@repo/ui'
import {
  LANDING_CTA_PRIMARY,
  LANDING_FOCUS_RING,
  LANDING_HEADING,
  LANDING_SHELL,
} from '../../constants/layout'
import { Reveal } from '../reveal'

type SectionOrganizersProps = {
  className?: string
}

export function SectionOrganizers({ className }: SectionOrganizersProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      id="organizadores"
      aria-labelledby="organizers-heading"
      className={cn(
        'scroll-mt-24 border-t border-hairline/40 bg-surface-container-low/40',
        className
      )}
    >
      <div
        className={cn(
          LANDING_SHELL,
          'grid gap-8 py-[clamp(3.5rem,9vw,6rem)] lg:grid-cols-12 lg:items-end lg:gap-12'
        )}
      >
        <Reveal className="lg:col-span-7">
          <p className="text-sm font-medium text-on-surface-variant">{t('organizers.kicker')}</p>
          <h2 id="organizers-heading" className={cn(LANDING_HEADING, 'mt-3 text-on-surface')}>
            {t('organizers.headline')}
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('organizers.support')}
          </p>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:justify-self-end">
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-control px-8 text-[15px] font-medium',
              LANDING_CTA_PRIMARY,
              LANDING_FOCUS_RING
            )}
          >
            {t('organizers.cta')}
          </a>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-on-surface-variant">
            {t('organizers.hint')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
