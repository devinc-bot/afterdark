import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/club-management')({
  component: ClubManagementLayout,
})

function ClubManagementLayout() {
  return (
    <main className="min-h-full bg-background">
      <Outlet />
    </main>
  )
}
