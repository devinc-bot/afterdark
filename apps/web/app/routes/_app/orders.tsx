import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { OrdersPage } from '~/modules/orders/components/orders-page'

export const Route = createFileRoute('/_app/orders')({
  component: OrdersRoute,
})

function OrdersRoute() {
  usePageTitle('orders', 'page.metaTitle')

  return <OrdersPage />
}
