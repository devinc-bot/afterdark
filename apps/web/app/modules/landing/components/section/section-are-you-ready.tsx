import { useTranslation } from 'react-i18next'
import { Link, cn } from '@afterdark/ui'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { LANDING_CTA_PRIMARY, LANDING_SHELL } from '../../constants/layout'
import { Reveal } from '../reveal'

type SectionAreYouReadyProps = {
  showAuthCtas?: boolean
  className?: string
}

export function SectionAreYouReady({ showAuthCtas = true, className }: SectionAreYouReadyProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="closing-heading"
      className={cn('border-t border-hairline/40', className)}
    >
      <div
        className={cn(
          LANDING_SHELL,
          'relative flex flex-col items-center py-[clamp(4.5rem,12vw,8rem)] text-center'
        )}
      >
        <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center">
          <h2
            id="closing-heading"
            className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-balance text-on-surface"
          >
            {t('closing.headline')}
          </h2>
          <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-pretty text-on-surface-variant">
            {t('closing.support')}
          </p>

          {showAuthCtas ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={WEB_ROUTES.register()}
                size="lg"
                className={cn('px-8', LANDING_CTA_PRIMARY)}
              >
                {t('closing.cta')}
              </Link>
              <Link
                to={WEB_ROUTES.login()}
                variant="outline"
                size="lg"
                className="min-h-11 rounded-lg border-hairline/60 bg-transparent text-on-surface hover:bg-surface-container-low"
              >
                {t('nav.login')}
              </Link>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
