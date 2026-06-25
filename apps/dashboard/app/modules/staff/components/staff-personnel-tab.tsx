import { StaffUserRecords } from '~/modules/staff/components/staff-user-records'
import {
  StaffPersonnelEmptyState,
  StaffPersonnelLoadErrorBanner,
  StaffPersonnelTabSkeleton,
} from '~/modules/staff/components/staff-personnel-tab-states'
import { useStaffPersonnel } from '~/modules/staff/queries/use-staff-personnel'

export function StaffPersonnelTab() {
  const { data, isPending, isError, isFetching, refetch } = useStaffPersonnel()

  if (isPending) {
    return <StaffPersonnelTabSkeleton />
  }

  if (isError) {
    return <StaffPersonnelLoadErrorBanner onRetry={() => void refetch()} isRetrying={isFetching} />
  }

  const records = data ?? []

  if (records.length === 0) {
    return <StaffPersonnelEmptyState />
  }

  return <StaffUserRecords records={records} statusControlsDisabled />
}
