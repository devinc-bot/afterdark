import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@afterdark/ui'
import { handleSectionNavClick } from '../utils/scroll-to-section.utils'

const SHELL = 'mx-auto max-w-7xl px-margin-mobile sm:px-8 lg:px-margin-desktop'

const SOCIAL_LINKS = [
  {
    key: 'instagram',
    href: 'https://www.instagram.com/afterdark',
    labelKey: 'footer.social.instagram',
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/afterdark',
    labelKey: 'footer.social.facebook',
  },
] as const

const FOOTER_NAV = [
  { href: '#como-funciona', labelKey: 'nav.how' },
  { href: '#claridad', labelKey: 'nav.clarity' },
  { href: '#eventos', labelKey: 'nav.events' },
] as const

const SOCIAL_ICON_CLASS = 'h-8 w-8 shrink-0'

function InstagramIcon() {
  return (
    <svg
      className={SOCIAL_ICON_CLASS}
      width={32}
      height={32}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      className={SOCIAL_ICON_CLASS}
      width={32}
      height={32}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.2l.8-3H14V9z" />
    </svg>
  )
}

const SOCIAL_ICONS: Record<(typeof SOCIAL_LINKS)[number]['key'], ReactNode> = {
  instagram: <InstagramIcon />,
  facebook: <FacebookIcon />,
}

export function LandingFooter() {
  const { t } = useTranslation('landing')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline/40">
      <div className={cn(SHELL, 'py-12 sm:py-14')}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="font-display text-lg font-bold tracking-tight">{t('nav.brand')}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
              {t('footer.tagline')}
            </p>
          </div>

          <nav
            aria-label={t('footer.navAria')}
            className="flex flex-col gap-4 lg:col-span-3 lg:col-start-7"
          >
            <p className="font-display text-base font-semibold tracking-tight text-on-surface sm:text-lg">
              {t('footer.explore')}
            </p>
            <ul className="flex flex-col gap-1">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(event) => handleSectionNavClick(event, item.href)}
                    className="inline-flex min-h-10 items-center font-label text-sm text-on-surface-variant transition-colors duration-(--duration-fast) ease-emphasized hover:text-on-surface focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="font-display text-base font-semibold tracking-tight text-on-surface sm:text-lg">
              {t('footer.social.title')}
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-14 items-center justify-center rounded-full border border-hairline/50 text-on-surface transition-colors duration-(--duration-fast) ease-emphasized hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    aria-label={t(item.labelKey)}
                  >
                    {SOCIAL_ICONS[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-hairline/40 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm text-on-surface-variant">{t('footer.rights', { year })}</p>
          <p className="max-w-md text-sm leading-relaxed text-on-surface-variant sm:text-right">
            {t('footer.madeFor')}
          </p>
        </div>
      </div>
    </footer>
  )
}
