import { useTranslation } from 'react-i18next'
import { Card, cn } from '@repo/ui'
import { formatEventWhenCompact } from '../../utils/events-discover-format'
import { EventDetailBuyButton } from './event-detail-buy-button'

/** Ticket sales are not live yet — keep the CTA honest until checkout ships. */
const TICKETS_AVAILABLE = false

type EventDetailPurchasePanelProps = {
  startsAt: Date | string
  className?: string
}

export function EventDetailPurchasePanel({ startsAt, className }: EventDetailPurchasePanelProps) {
  const { t, i18n } = useTranslation('events')
  const whenCompact = formatEventWhenCompact(startsAt, i18n.language)
  const ticketsAvailable = TICKETS_AVAILABLE

  return (
    <Card
      as="aside"
      aria-label={t('discover.detail.purchasePanelAriaLabel')}
      className={cn(
        'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5',
        'bg-surface-raised shadow-[0_8px_28px_rgba(0,0,0,0.12)]',
        className
      )}
    >
      <div className="min-w-0">
        <p className="font-display text-base font-semibold tracking-tight text-balance text-on-surface">
          {ticketsAvailable ? t('discover.detail.ticketsReady') : t('discover.detail.ticketsSoon')}
        </p>
        {whenCompact ? (
          <p className="mt-1 font-label text-sm text-on-surface-variant">{whenCompact}</p>
        ) : null}
        {!ticketsAvailable ? (
          <p className="mt-2 max-w-[28ch] font-body text-sm leading-relaxed text-pretty text-on-surface-variant">
            {t('discover.detail.ticketsUnavailableHint')}
          </p>
        ) : null}
      </div>

      <EventDetailBuyButton
        label={
          ticketsAvailable
            ? t('discover.detail.buyTickets')
            : t('discover.detail.buyTicketsUnavailable')
        }
        disabled={!ticketsAvailable}
        title={ticketsAvailable ? undefined : t('discover.detail.buyTicketsDisabled')}
      />
    </Card>
  )
}
