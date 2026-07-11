import { Card } from '@afterdark/ui'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation('dashboard')

  return (
    <div className="flex min-h-dvh w-full justify-center overflow-y-auto bg-background px-margin-mobile py-8 text-on-surface md:px-margin-desktop md:py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_10%,color-mix(in_oklch,var(--color-primary)_7%,transparent)_0%,transparent_50%),radial-gradient(ellipse_at_85%_90%,color-mix(in_oklch,var(--color-inverse-primary)_5%,transparent)_0%,transparent_45%)]"
      />

      <Card
        as="main"
        variant="gradient"
        className="motion-reduce:animate-none relative z-10 my-auto w-full max-w-md animate-fade-up px-6 py-8 shadow-glass md:px-8 md:py-10"
      >
        <header className="mb-8 flex flex-col items-center text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance text-on-surface md:text-4xl">
            {t('brand.logo')}
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-pretty text-on-surface-variant">
            {t('shell.tagline')}
          </p>
        </header>

        {children}

        <p className="mt-8 text-center text-xs text-on-surface-variant">{t('shell.footer')}</p>
      </Card>
    </div>
  )
}
