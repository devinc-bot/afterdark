import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@afterdark/ui'
import { StaffInvitations } from '~/modules/staff/components/staff-invitations'
import {
  StaffInvitationsEmptyState,
  StaffInvitationsLoadErrorBanner,
  StaffInvitationsTabSkeleton,
} from '~/modules/staff/components/staff-invitations-tab-states'
import { useDeleteStaffInvitation } from '~/modules/staff/mutations/use-staff-invitations-mutations'
import { useStaffInvitations } from '~/modules/staff/queries/use-staff-invitations'

type StaffInvitationsTabProps = {
  enabled: boolean
}

export function StaffInvitationsTab({ enabled }: StaffInvitationsTabProps) {
  const { t } = useTranslation('staff')
  const { data, isPending, isError, isFetching, refetch } = useStaffInvitations(enabled)
  const deleteInvitationMutation = useDeleteStaffInvitation()

  const handleDelete = useCallback(
    (invitationId: string) => {
      deleteInvitationMutation.mutate(invitationId, {
        onSuccess: () => {
          toast.success(t('invitationsTable.deleteSuccess'))
        },
        onError: () => {
          toast.error(t('invitationsTable.deleteError'))
        },
      })
    },
    [deleteInvitationMutation, t]
  )

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

  return (
    <StaffInvitations
      invitations={invitations}
      onDelete={handleDelete}
      deletingInvitationId={
        deleteInvitationMutation.isPending ? (deleteInvitationMutation.variables ?? null) : null
      }
    />
  )
}
