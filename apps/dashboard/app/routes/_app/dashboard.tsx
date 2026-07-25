import { createFileRoute } from '@tanstack/react-router'
import { USER_ROLE } from '@repo/types'
import { Loader } from '@repo/ui'
import { useSession } from '~/modules/common/hooks/use-session'
import { OwnerPanelView } from '~/modules/owner'
import { StaffPanelView } from '~/modules/staff-panel'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoading } = useSession()

  if (user?.role === USER_ROLE.STAFF) {
    return <StaffPanelView />
  }

  if (user?.role === USER_ROLE.OWNER) {
    return <OwnerPanelView />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
        <Loader size={24} />
      </div>
    )
  }

  return null
}
