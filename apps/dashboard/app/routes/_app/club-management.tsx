import { createFileRoute } from '@tanstack/react-router'
import { KpiInformation } from '~/modules/club-management/components/kpi-information'
import { RegisteredClubs } from '~/modules/club-management/components/registered-clubs'

export const Route = createFileRoute('/_app/club-management')({
  component: ClubManagementPage,
})

function ClubManagementPage() {
  return (
    <main className="bg-background px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Clubs</h1>
          <p className="mt-1 text-ink-muted">Gestioná los clubes registrados en la plataforma</p>
        </header>
        <KpiInformation />
        <RegisteredClubs />
      </div>
    </main>
  )
}
