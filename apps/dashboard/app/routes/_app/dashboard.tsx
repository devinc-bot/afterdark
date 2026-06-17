import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <main className="bg-background px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-ink-muted">Resumen general del Management Hub</p>
        </header>
      </div>
    </main>
  )
}
