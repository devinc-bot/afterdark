import { createFileRoute } from '@tanstack/react-router'
import { StaffManagementView } from '~/modules/staff/components/staff-management-view'
import { staffPersonnelQueryOptions } from '~/modules/staff/queries/use-staff-personnel'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/_app/staff')({
  loader: ({ context: { queryClient } }) => queryClient.prefetchQuery(staffPersonnelQueryOptions()),
  component: StaffManagementPage,
})

function StaffManagementPage() {
  usePageTitle('staff', 'page.metaTitle')

  return <StaffManagementView />
}
