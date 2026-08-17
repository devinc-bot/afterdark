import { createFileRoute } from '@tanstack/react-router'
import { AdminHome } from '~/modules/home/components/admin-home'
import { RequireAdminSession } from '~/modules/common/components/require-admin-session'

export const Route = createFileRoute('/')({
  component: AdminHomeRoute,
})

function AdminHomeRoute() {
  return (
    <RequireAdminSession>
      <AdminHome />
    </RequireAdminSession>
  )
}
