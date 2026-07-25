import { Outlet, createFileRoute } from '@tanstack/react-router'
import { PublicAppShell } from '~/modules/common/components/public-app-shell'
import { RequireAuth } from '~/modules/common/components/require-auth'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <RequireAuth>
      <PublicAppShell>
        <Outlet />
      </PublicAppShell>
    </RequireAuth>
  )
}
