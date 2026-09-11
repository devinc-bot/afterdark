import { UserRound, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, cn } from '@repo/ui'
import { Container } from '~/modules/common/components/container'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import {
  LANDING_CTA_GHOST,
  LANDING_CTA_PRIMARY,
  LANDING_FOCUS_RING,
  LANDING_SECTION_Y,
} from '../../constants/layout'

type SectionAreYouReadyProps = {
  showAuthCtas?: boolean
  className?: string
}

export function SectionAreYouReady({ showAuthCtas = true, className }: SectionAreYouReadyProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="closing-heading"
      className={cn('border-t border-outline-variant/30 bg-surface-container-lowest', className)}
    >
      <Container
        className={cn(LANDING_SECTION_Y, 'relative flex flex-col items-center text-center')}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
          <h2
            id="closing-heading"
            className="font-display text-[clamp(1.85rem,4.5vw,3rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('closing.headline')}
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-pretty text-on-surface-variant sm:text-lg">
            {t('closing.support')}
          </p>

          {showAuthCtas ? (
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={WEB_ROUTES.register()}
                size="lg"
                className={cn('px-8 py-4', LANDING_CTA_PRIMARY, LANDING_FOCUS_RING)}
              >
                {t('closing.cta')}
              </Link>
              <Link
                to={WEB_ROUTES.login()}
                variant="outline"
                size="lg"
                className={cn('px-7 py-4', LANDING_CTA_GHOST, LANDING_FOCUS_RING)}
              >
                {t('closing.ctaSecondary')}
              </Link>
            </div>
          ) : null}

          <ul className="mt-10 flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-3 p-0">
            <li className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
              <UserRound className="size-7 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              {t('closing.trust.1')}
            </li>
            <li className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
              <Zap className="size-7 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              {t('closing.trust.2')}
            </li>
          </ul>
        </div>
      </Container>
    </section>
  )
}
