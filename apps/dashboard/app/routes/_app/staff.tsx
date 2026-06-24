import { createFileRoute } from '@tanstack/react-router'
import { StaffManagementView } from '~/modules/staff/components/staff-management-view'
import { STAFF_COPY } from '~/modules/staff/constants/staff.copy'

export const Route = createFileRoute('/_app/staff')({
  head: () => ({ meta: [{ title: STAFF_COPY.page.metaTitle }] }),
  component: StaffManagementPage,
})

function StaffManagementPage() {
  return <StaffManagementView />
}
