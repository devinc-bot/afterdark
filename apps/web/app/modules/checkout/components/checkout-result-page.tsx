import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button, Card } from '@repo/ui'
import { PAYMENT_STATUS, type PaymentStatus } from '@repo/types'
import { useOrderQuery } from '../queries/use-order-query'

type CheckoutResultContent = {
  descriptionKey:
    | 'discover.checkout.success'
    | 'discover.checkout.pending'
    | 'discover.checkout.error'
  titleKey:
    | 'discover.checkout.successTitle'
    | 'discover.checkout.pendingTitle'
    | 'discover.checkout.errorTitle'
}

function getCheckoutResultContent(status: PaymentStatus): CheckoutResultContent {
  if (status === PAYMENT_STATUS.COMPLETED) {
    return {
      titleKey: 'discover.checkout.successTitle',
      descriptionKey: 'discover.checkout.success',
    }
  }
  if (status === PAYMENT_STATUS.PENDING) {
    return {
      titleKey: 'discover.checkout.pendingTitle',
      descriptionKey: 'discover.checkout.pending',
    }
  }
  return { titleKey: 'discover.checkout.errorTitle', descriptionKey: 'discover.checkout.error' }
}

export function CheckoutResultPage({ orderId }: { orderId: string }) {
  const { t } = useTranslation('events')
  const { data: order, isError, isLoading } = useOrderQuery(orderId)

  if (isLoading) {
    return (
      <Card className="mx-auto mt-10 w-full max-w-lg p-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-on-surface">
          {t('discover.checkout.pendingTitle')}
        </h1>
        <p className="mt-3 text-on-surface-variant">{t('discover.checkout.pending')}</p>
      </Card>
    )
  }

  const content = getCheckoutResultContent(order?.status ?? PAYMENT_STATUS.REJECTED)

  return (
    <Card className="mx-auto mt-10 w-full max-w-lg p-6 text-center">
      <h1 className="font-display text-3xl font-semibold text-on-surface">{t(content.titleKey)}</h1>
      <p className="mt-3 text-on-surface-variant">{t(content.descriptionKey)}</p>
      {isError || content.titleKey === 'discover.checkout.errorTitle' ? (
        <Button asChild className="mt-6">
          <Link to="/events">{t('discover.detail.backToEvents')}</Link>
        </Button>
      ) : null}
    </Card>
  )
}
