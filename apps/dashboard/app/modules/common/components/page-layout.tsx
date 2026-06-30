import type { ReactNode } from 'react'

type PageLayoutProps = {
  title: string
  description?: string
  children?: ReactNode
  narrow?: boolean
}

export function PageLayout({ title, description, children, narrow = false }: PageLayoutProps) {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div
        className={
          narrow
            ? 'mx-auto flex max-w-3xl flex-col gap-2 sm:gap-4'
            : 'mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8'
        }
      >
        <header className={narrow ? 'max-w-2xl pb-2' : 'max-w-2xl'}>
          <h1
            className={
              narrow
                ? 'text-balance font-heading text-2xl font-semibold text-ink sm:text-3xl'
                : 'text-balance font-heading text-2xl font-bold text-ink sm:text-3xl'
            }
          >
            {title}
          </h1>
          {description ? (
            <p
              className={
                narrow
                  ? 'mt-2 text-pretty text-sm text-ink-muted sm:text-base'
                  : 'mt-2 text-pretty text-base text-ink-muted'
              }
            >
              {description}
            </p>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  )
}
