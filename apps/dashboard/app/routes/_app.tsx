import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '~/modules/common/components/app-shell'
import { AppErrorBoundaryView } from '~/modules/common/components/error-boundary-view'
import { RequireSession } from '~/modules/common/components/require-session'
import { RolesGuard } from '~/modules/common/components/roles-guard'

export const Route = createFileRoute('/_app')({
  errorComponent: ({ error, reset }) => <AppErrorBoundaryView error={error} reset={reset} />,
  component: AppLayout,
})

function AppLayout() {
  return (
    <RequireSession>
      <AppShell>
        <RolesGuard>
          <Outlet />
        </RolesGuard>
      </AppShell>
    </RequireSession>
  )
}
