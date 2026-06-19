import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '~/modules/common/components/app-shell'
import { RequireSession } from '~/modules/common/components/require-session'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <RequireSession>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireSession>
  )
}
