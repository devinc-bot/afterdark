import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import { useSession } from '~/modules/common/hooks/use-session'
import { createPendingOrder } from '~/modules/checkout/services/checkout.service'

type UsePurchaseTicketOptions = {
  eventId: string
}

export function usePurchaseTicket({ eventId }: UsePurchaseTicketOptions) {
  const { t } = useTranslation('events')
  const { isAuthenticated, isLoading: isSessionLoading } = useSession()
  const navigate = useNavigate()
  const [purchasingTicketId, setPurchasingTicketId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function purchaseTicket(ticketId: string) {
    if (!isAuthenticated) {
      await navigate({
        to: WEB_ROUTES.login(),
        search: { returnTo: WEB_ROUTES.event(eventId) } as never,
      })
      return
    }

    setPurchasingTicketId(ticketId)
    setError(null)
    try {
      const pendingOrder = await createPendingOrder({ ticketId, quantity: 1 })
      window.location.assign(pendingOrder.checkoutUrl)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : t('discover.detail.purchaseError')
      )
      setPurchasingTicketId(null)
    }
  }

  return {
    purchaseTicket,
    purchasingTicketId,
    isSessionLoading,
    error,
  }
}
