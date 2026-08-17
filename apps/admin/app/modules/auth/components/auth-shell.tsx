import type { ReactNode } from 'react'
import { AppLogo } from '@repo/ui'
import { useTranslation } from 'react-i18next'

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation('common')

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-on-surface">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,color-mix(in_oklch,var(--color-primary)_8%,transparent)_0%,transparent_42%),radial-gradient(circle_at_88%_78%,color-mix(in_oklch,var(--color-inverse-primary)_6%,transparent)_0%,transparent_38%)]"
      />

      <header className="relative z-10 px-6 py-5 sm:px-8">
        <div className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-on-surface">
          <AppLogo />
          <span>{t('appNameAdmin')}</span>
        </div>
      </header>

      <main className="relative z-10 grid flex-1 place-items-center px-6 py-12">
        <div className="motion-reduce:animate-none w-full max-w-md animate-fade-up">{children}</div>
      </main>
    </div>
  )
}
