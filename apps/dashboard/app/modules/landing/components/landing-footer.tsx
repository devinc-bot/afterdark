import { useTranslation } from 'react-i18next'
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const FOOTER_GROUPS = [
  {
    title: 'footer.product',
    links: [
      { labelKey: 'footer.features', hash: '#features' },
      { labelKey: 'footer.how', hash: '#how' },
      { labelKey: 'footer.faq', hash: '#faq' },
    ],
  },
  {
    title: 'footer.company',
    links: [{ labelKey: 'footer.about' }, { labelKey: 'footer.contact' }],
  },
  {
    title: 'footer.legal',
    links: [{ labelKey: 'footer.terms' }, { labelKey: 'footer.privacy' }],
  },
] as const

const FOOTER_LINK =
  'inline-flex min-h-8 items-center text-sm text-on-surface-variant transition-colors duration-(--duration-fast) ease-emphasized hover:text-on-surface focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/25'

export function LandingFooter() {
  const { t } = useTranslation('dashboardLanding')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface-container-lowest">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-margin-mobile py-[clamp(3rem,6vw,4.5rem)] md:grid-cols-12 md:px-margin-desktop">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2">
            <img
              src="/landing/logo.png"
              alt=""
              aria-hidden="true"
              className="size-12 object-contain"
            />
            <span className="font-display text-lg font-bold tracking-tight text-on-surface">
              {t('header.brand')}
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-surface-variant">
            {t('footer.tagline')}
          </p>
        </div>

        <nav
          aria-label={t('footer.navAria')}
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8"
        >
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="font-label text-sm tracking-label-sm text-on-surface">
                {t(group.title)}
              </p>
              <ul className="mt-4 space-y-1">
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    {'hash' in link ? (
                      <a
                        href={link.hash}
                        onClick={(event) => handleSectionNavClick(event, link.hash)}
                        className={FOOTER_LINK}
                      >
                        {t(link.labelKey)}
                      </a>
                    ) : (
                      <span
                        aria-disabled
                        className="cursor-default text-sm text-on-surface-variant"
                      >
                        {t(link.labelKey)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-hairline/60">
        <div className="mx-auto w-full max-w-6xl px-margin-mobile py-6 md:px-margin-desktop">
          <p className="text-xs text-on-surface-variant">{t('footer.rights', { year })}</p>
        </div>
      </div>
    </footer>
  )
}
