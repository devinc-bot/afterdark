import { createFileRoute } from '@tanstack/react-router'
// import { KpiInformation } from '~/modules/club-management/components/kpi-information'
import { RegisteredClubs } from '~/modules/club-management/components/registered-clubs'

export const Route = createFileRoute('/_app/club-management')({
  component: ClubManagementPage,
})

function ClubManagementPage() {
  return (
    <main className="bg-background px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8">
        <header className="max-w-2xl">
          <h1 className="text-balance font-heading text-2xl font-bold text-ink sm:text-3xl">
            Clubes
          </h1>
          <p className="mt-2 text-pretty text-base text-ink-muted">
            Gestioná los clubes registrados, su estado operativo y la información publicada en la
            plataforma.
          </p>
        </header>

        {/* <KpiInformation /> */}

        <RegisteredClubs />
      </div>
    </main>
  )
}
