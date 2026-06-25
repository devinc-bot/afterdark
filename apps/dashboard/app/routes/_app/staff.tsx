import { createFileRoute } from '@tanstack/react-router'
import { StaffManagementView } from '~/modules/staff/components/staff-management-view'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'
import { staffPersonnelQueryOptions } from '~/modules/staff/queries/use-staff-personnel'

export const Route = createFileRoute('/_app/staff')({
  head: () => ({ meta: [{ title: STAFF_COPY.page.metaTitle }] }),
  loader: ({ context: { queryClient } }) => queryClient.prefetchQuery(staffPersonnelQueryOptions()),
  component: StaffManagementPage,
})

function StaffManagementPage() {
  return <StaffManagementView />
}
