import { useTranslation } from 'react-i18next'

const FOOTER_GROUPS = [
  { title: 'footer.product', links: ['footer.features', 'footer.how', 'footer.faq'] },
  { title: 'footer.company', links: ['footer.about', 'footer.contact'] },
  { title: 'footer.legal', links: ['footer.terms', 'footer.privacy'] },
] as const

export function LandingFooter() {
  const { t } = useTranslation('dashboardLanding')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface-container-lowest">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-margin-mobile py-[clamp(3rem,6vw,4.5rem)] md:grid-cols-12 md:px-margin-desktop">
        <div className="md:col-span-4">
          <p className="font-display text-lg font-bold tracking-tight text-on-surface">afterdark</p>
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
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <span aria-disabled className="cursor-default text-sm text-on-surface-variant">
                      {t(link)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-hairline/60">
        <div className="mx-auto w-full max-w-6xl px-margin-mobile py-6 md:px-margin-desktop">
          <p className="text-xs text-on-surface-variant">
            {t('footer.rights', { year, appName: 'afterdark' })}
          </p>
        </div>
      </div>
    </footer>
  )
}
