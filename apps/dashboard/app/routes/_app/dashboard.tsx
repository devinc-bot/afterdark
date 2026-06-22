import { createFileRoute } from '@tanstack/react-router'
import { APP_SHELL_COPY } from '~/modules/common/constants/app-shell.copy'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <main className="bg-background px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <h1 className="text-balance font-heading text-2xl font-bold text-ink sm:text-3xl">
            {APP_SHELL_COPY.pages.panel.title}
          </h1>
          <p className="mt-2 text-pretty text-base text-ink-muted">
            {APP_SHELL_COPY.pages.panel.description}
          </p>
        </header>
      </div>
    </main>
  )
}
