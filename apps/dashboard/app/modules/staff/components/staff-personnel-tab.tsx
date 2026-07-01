import { StaffUserRecords } from '~/modules/staff/components/staff-user-records'
import {
  StaffPersonnelEmptyState,
  StaffPersonnelTabSkeleton,
} from '~/modules/staff/components/staff-personnel-tab-states'
import { useStaffPersonnel } from '~/modules/staff/queries/use-staff-personnel'
import { LoadErrorBanner } from '~/modules/common/components/load-error-banner'
import { useTranslation } from 'react-i18next'

export function StaffPersonnelTab() {
  const { data, isPending, isError, isFetching, refetch } = useStaffPersonnel()
  const { t } = useTranslation('staff')

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

  return <StaffUserRecords records={records} statusControlsDisabled />
}
