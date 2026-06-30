import { createFileRoute } from '@tanstack/react-router'
import staffEs from '@afterdark/i18n/locales/staff/es.json'
import { StaffManagementView } from '~/modules/staff/components/staff-management-view'
import { staffPersonnelQueryOptions } from '~/modules/staff/queries/use-staff-personnel'

export const Route = createFileRoute('/_app/staff')({
  head: () => ({ meta: [{ title: staffEs.page.metaTitle }] }),
  loader: ({ context: { queryClient } }) => queryClient.prefetchQuery(staffPersonnelQueryOptions()),
  component: StaffManagementPage,
})

function StaffManagementPage() {
  return <StaffManagementView />
}
