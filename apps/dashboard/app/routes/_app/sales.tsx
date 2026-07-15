import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@afterdark/ui'
import { SalesManagementView } from '~/modules/sales/components/sales-management-view'

export const Route = createFileRoute('/_app/sales')({
  component: SalesPage,
})

function SalesPage() {
  usePageTitle('sales', 'page.metaTitle')

  return <SalesManagementView />
}
