import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '~/modules/common/components/app-shell'
import { RequireAdminSession } from '~/modules/common/components/require-admin-session'

export const Route = createFileRoute('/_app')({
  component: AdminAppLayout,
})

function AdminAppLayout() {
  return (
    <RequireAdminSession>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireAdminSession>
  )
}
