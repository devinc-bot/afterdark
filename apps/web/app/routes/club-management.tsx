import { createFileRoute } from '@tanstack/react-router'
import { KpiInformation } from '~/modules/club-management/components/kpi-information'
import { RegisteredClubs } from '~/modules/club-management/components/registered-clubs'

export const Route = createFileRoute('/club-management')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="bg-background px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <KpiInformation />
        <RegisteredClubs />
      </div>
    </main>
  )
}
