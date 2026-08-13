import { createFileRoute } from '@tanstack/react-router'
import { CheckoutResultPage } from '~/modules/checkout/components/checkout-result-page'

export const Route = createFileRoute('/checkout/$orderId/error')({
  component: () => <CheckoutResultPage orderId={Route.useParams().orderId} />,
})
