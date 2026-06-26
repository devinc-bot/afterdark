import { StaffInvitations } from '~/modules/staff/components/staff-invitations'
import {
  StaffInvitationsEmptyState,
  StaffInvitationsLoadErrorBanner,
  StaffInvitationsTabSkeleton,
} from '~/modules/staff/components/staff-invitations-tab-states'
import { useStaffInvitations } from '~/modules/staff/queries/use-staff-invitations'

type StaffInvitationsTabProps = {
  enabled: boolean
}

export function StaffInvitationsTab({ enabled }: StaffInvitationsTabProps) {
  const { data, isPending, isError, isFetching, refetch } = useStaffInvitations(enabled)

  if (!enabled) {
    return null
  }

  if (isPending) {
    return <StaffInvitationsTabSkeleton />
  }

  if (isError) {
    return (
      <StaffInvitationsLoadErrorBanner onRetry={() => void refetch()} isRetrying={isFetching} />
    )
  }

  const invitations = data ?? []

  if (invitations.length === 0) {
    return <StaffInvitationsEmptyState />
  }

  return <StaffInvitations invitations={invitations} />
}
