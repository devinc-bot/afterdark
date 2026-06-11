import type { ReactNode } from 'react'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-6 py-10 text-on-surface">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,177,255,0.06)_0%,transparent_45%),radial-gradient(circle_at_80%_80%,rgba(125,74,144,0.05)_0%,transparent_40%)]"
      />

      <main className="relative z-10 w-full max-w-[440px]">
        <header className="mb-8 flex flex-col items-center text-center">
          <div
            aria-hidden
            className="mb-5 flex size-16 items-center justify-center rounded-full border border-outline-variant bg-surface-container md:size-20"
          >
            <span className="font-display text-2xl font-bold text-primary md:text-3xl">AD</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
            Afterdark
          </h1>
          <p className="mt-2 max-w-xs text-sm text-on-surface-variant">
            Panel de administración para locales y eventos
          </p>
        </header>

        {children}

        <p className="mt-8 text-center text-xs text-on-surface-variant">Suite de gestión v2.4.0</p>
      </main>
    </div>
  )
}
