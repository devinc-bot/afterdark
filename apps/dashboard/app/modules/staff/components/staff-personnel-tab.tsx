import { StaffUserRecords } from '~/modules/staff/components/staff-user-records'
import {
  StaffPersonnelEmptyState,
  StaffPersonnelTabSkeleton,
} from '~/modules/staff/components/staff-personnel-tab-states'
import { useStaffPersonnel } from '~/modules/staff/queries/use-staff-personnel'
import {
  useDeleteStaffUser,
  useUpdateStaffUserStatus,
} from '~/modules/staff/mutations/use-staff-personnel-mutations'
import { LoadErrorBanner } from '~/modules/common/components/load-error-banner'
import { useTranslation } from 'react-i18next'

export function StaffPersonnelTab() {
  const { data, isPending, isError, isFetching, refetch } = useStaffPersonnel()
  const { t } = useTranslation('staff')
  const updateStatusMutation = useUpdateStaffUserStatus()
  const deleteMutation = useDeleteStaffUser()

  if (isPending) {
    return <StaffPersonnelTabSkeleton />
  }

  if (isError) {
    return (
      <LoadErrorBanner
        title={t('table.loadError')}
        message={t('table.loadError')}
        retryLabel={t('table.retry')}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const records = data ?? []

  if (records.length === 0) {
    return <StaffPersonnelEmptyState />
  }

  const getPendingRecordId = (): string | null => {
    if (updateStatusMutation.isPending) {
      return updateStatusMutation.variables?.documentId ?? null
    } else if (deleteMutation.isPending) {
      return deleteMutation.variables ?? null
    }
    return null
  }

  return (
    <StaffUserRecords
      records={records}
      statusControlsDisabled={updateStatusMutation.isPending || deleteMutation.isPending}
      pendingRecordId={getPendingRecordId()}
      onStatusChange={(recordId, status) =>
        updateStatusMutation.mutate({ documentId: recordId, status })
      }
      onDelete={(recordId) => deleteMutation.mutate(recordId)}
    />
  )
}
