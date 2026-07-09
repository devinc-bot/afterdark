import { createFileRoute } from '@tanstack/react-router'
import { USER_ROLE } from '@afterdark/types'
import { useSession } from '~/modules/common/hooks/use-session'
import { OwnerPanelView } from '~/modules/owner'
import { StaffPanelView } from '~/modules/staff-panel'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useSession()

  if (user?.role === USER_ROLE.STAFF) {
    return <StaffPanelView />
  }

  if (user?.role === USER_ROLE.OWNER) {
    return <OwnerPanelView />
  }

  return null
}
