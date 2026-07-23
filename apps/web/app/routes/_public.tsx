import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PublicAppShell } from '~/modules/common/components/public-app-shell'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <PublicAppShell>
      <Outlet />
    </PublicAppShell>
  )
}
