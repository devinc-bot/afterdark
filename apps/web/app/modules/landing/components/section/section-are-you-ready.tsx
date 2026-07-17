import { useTranslation } from 'react-i18next'
import { Link, cn } from '@afterdark/ui'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { Reveal } from '../reveal'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'

type SectionAreYouReadyProps = {
  showAuthCtas?: boolean
  className?: string
}

export function SectionAreYouReady({ showAuthCtas = true, className }: SectionAreYouReadyProps) {
  const { t } = useTranslation('landing')

  return (
    <section
      aria-labelledby="closing-heading"
      className={cn('relative overflow-hidden border-t border-hairline/40', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_50%)]"
      />

      <div
        className={cn(
          SHELL,
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
                className="min-h-11 rounded-lg bg-on-surface px-8 text-on-primary-fixed shadow-sm hover:bg-on-surface/90"
              >
                {t('closing.cta')}
              </Link>
              <Link
                to={WEB_ROUTES.login()}
                variant="outline"
                size="lg"
                className="min-h-11 rounded-lg border-hairline/60 bg-surface-container-low text-on-surface hover:bg-surface-container"
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
