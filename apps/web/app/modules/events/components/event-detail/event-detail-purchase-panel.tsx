import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@repo/common'
import type { PublicPurchasableTicketResponse } from '@repo/types'
import { Card, cn } from '@repo/ui'
import { formatEventWhenCompact } from '../../utils/events-discover-format'
import { EventDetailBuyButton } from './event-detail-buy-button'
import { usePurchaseTicket } from '~/modules/checkout/hooks/use-purchase-ticket'

type EventDetailPurchasePanelProps = {
  eventId: string
  startsAt: Date | string
  tickets: PublicPurchasableTicketResponse[]
  paymentsReady: boolean
  className?: string
}

function formatTicketPrice(price: number, locale: string): string {
  return formatCurrency(price, {
    locale,
    options: { maximumFractionDigits: 0 },
  })
}

export function EventDetailPurchasePanel({
  eventId,
  startsAt,
  tickets,
  paymentsReady,
  className,
}: EventDetailPurchasePanelProps) {
  const { t, i18n } = useTranslation('events')
  const { purchaseTicket, purchasingTicketId, isSessionLoading, error } = usePurchaseTicket({
    eventId,
  })
  const whenCompact = formatEventWhenCompact(startsAt, i18n.language)
  const hasTickets = tickets.length > 0

  return (
    <Card
      as="aside"
      aria-label={t('discover.detail.purchasePanelAriaLabel')}
      className={cn(
        'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5',
        'bg-surface-raised glass-panel',
        className
      )}
    >
      <div className="min-w-0">
        <p className="font-display text-base font-semibold tracking-tight text-balance text-on-surface">
          {hasTickets ? t('discover.detail.ticketsReady') : t('discover.detail.ticketsSoon')}
        </p>
        {whenCompact ? (
          <p className="mt-1 font-label text-sm text-on-surface-variant">{whenCompact}</p>
        ) : null}
        {!hasTickets ? (
          <p className="mt-2 max-w-[28ch] font-body text-sm leading-relaxed text-pretty text-on-surface-variant">
            {t('discover.detail.ticketsUnavailableHint')}
          </p>
        ) : null}
      </div>

      {hasTickets ? (
        <div className="w-full border-t border-hairline/35 pt-4 sm:max-w-sm sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <ul
            className="flex flex-col divide-y divide-hairline/35"
            aria-label={t('discover.detail.ticketsReady')}
          >
            {tickets.map((ticket) => {
              const isSoldOut = ticket.remainingQuantity <= 0
              const isDisabled = !paymentsReady || isSoldOut
              const isPurchasing = purchasingTicketId === ticket.documentId
              const unavailableReason = !paymentsReady
                ? t('discover.detail.buyTicketsDisabled')
                : isSoldOut
                  ? t('discover.detail.ticketSoldOut')
                  : undefined

              return (
                <li
                  key={ticket.documentId}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex w-fit flex-col gap-1">
                      <p className="truncate font-body text-sm font-semibold text-on-surface">
                        {ticket.name}
                      </p>
                      <p className="mt-0.5 font-label text-xs text-on-surface-variant">
                        {t(`discover.detail.ticketType.${ticket.type}`)} ·{' '}
                        {isSoldOut
                          ? t('discover.detail.ticketSoldOut')
                          : t('discover.detail.ticketAvailability', {
                              count: ticket.remainingQuantity,
                            })}
                      </p>
                    </div>
                    <div className="flex w-fit">
                      <p className="font-display text-base font-semibold tracking-tight text-on-surface">
                        {formatTicketPrice(ticket.price, i18n.language)}
                      </p>
                    </div>
                  </div>
                  <EventDetailBuyButton
                    label={
                      isSoldOut
                        ? t('discover.detail.ticketSoldOut')
                        : t('discover.detail.buyTickets')
                    }
                    disabled={isDisabled || isSessionLoading || purchasingTicketId !== null}
                    loading={isPurchasing}
                    title={unavailableReason}
                    onClick={() => void purchaseTicket(ticket.documentId)}
                  />
                </li>
              )
            })}
          </ul>
          {error ? (
            <p role="alert" className="mt-4 text-sm text-error">
              {error}
            </p>
          ) : null}
          {!paymentsReady ? (
            <p className="mt-4 max-w-[34ch] font-body text-sm leading-relaxed text-pretty text-on-surface-variant">
              {t('discover.detail.paymentsUnavailableHint')}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
