import { useTranslation } from 'react-i18next'
import { AppLogo } from '@repo/ui'
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const FOOTER_LINKS = [
  { labelKey: 'footer.features', hash: '#features' },
  { labelKey: 'footer.how', hash: '#how' },
  { labelKey: 'footer.audiences', hash: '#audiences' },
  { labelKey: 'footer.faq', hash: '#faq' },
] as const

const FOOTER_LINK =
  'inline-flex min-h-10 items-center text-sm text-on-surface-variant transition-colors duration-(--duration-fast) ease-emphasized hover:text-on-surface focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/25'

export function LandingFooter() {
  const { t } = useTranslation('dashboardLanding')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface-container-lowest">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-margin-mobile py-[clamp(3rem,6vw,4.5rem)] md:flex-row md:items-end md:justify-between md:px-margin-desktop">
        <div>
          <div className="flex items-center gap-2">
            <AppLogo size="xl" />
            <span className="font-display text-lg font-bold tracking-tight text-on-surface">
              {t('header.brand')}
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-surface-variant">
            {t('footer.tagline')}
          </p>
        </div>

        <nav aria-label={t('footer.navAria')}>
          <ul className="flex flex-wrap gap-x-1 gap-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.labelKey}>
                <a
                  href={link.hash}
                  onClick={(event) => handleSectionNavClick(event, link.hash)}
                  className={FOOTER_LINK + ' px-3'}
                >
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-hairline/60">
        <div className="mx-auto w-full max-w-6xl px-margin-mobile py-6 md:px-margin-desktop">
          <p className="text-sm text-on-surface-variant">{t('footer.rights', { year })}</p>
        </div>
      </div>
    </footer>
  )
}
