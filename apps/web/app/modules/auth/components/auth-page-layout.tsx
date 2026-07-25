import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLogo } from '@repo/ui'
import { WEB_ROUTES } from '~/modules/common/constants/routes'

export function AuthPageLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common')
  const year = new Date().getFullYear()

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-on-surface">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(236,177,255,0.08)_0%,transparent_42%),radial-gradient(circle_at_88%_78%,rgba(125,74,144,0.06)_0%,transparent_38%)]"
      />

      <header className="relative z-10 px-6 py-5 sm:px-8">
        <Link
          to={WEB_ROUTES.home()}
          className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-on-surface transition-opacity duration-150 hover:opacity-80"
        >
          <AppLogo />
          <span>{t('appName')}</span>
        </Link>
      </header>

      <main className="relative z-10 grid flex-1 place-items-center px-6 py-12">
        <div className="motion-reduce:animate-none w-full max-w-md animate-fade-up">{children}</div>
      </main>

      <footer className="relative z-10 px-6 py-5 text-center">
        <p className="text-xs text-on-surface-variant">
          © {year} {t('appName')}
        </p>
      </footer>
    </div>
  )
}
