import { CalendarDays, ReceiptText, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency, formatDate } from '@repo/common'
import { Badge, cn } from '@repo/ui'
import type { BuyerOrderSummaryResponse } from '@repo/types'
import { getOrderStatusBadgeVariant } from '../utils/order-display'

type OrderSummaryProps = {
  order: BuyerOrderSummaryResponse
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const { t, i18n } = useTranslation('orders')
  const orderDate = formatDate(order.createdAt, {
    locale: i18n.language,
    fallback: t('card.unavailable'),
    options: { dateStyle: 'medium', timeStyle: 'short' },
  })
  const eventDate = order.eventStartsAt
    ? formatDate(order.eventStartsAt, {
        locale: i18n.language,
        fallback: t('card.unavailable'),
        options: { dateStyle: 'medium', timeStyle: 'short' },
      })
    : null

  return (
    <article className="grid gap-5 rounded-app-lg border border-hairline/35 bg-surface-card px-5 py-5 shadow-none sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="min-w-0 truncate font-display text-lg font-semibold tracking-tight text-on-surface">
            {order.eventName ?? t('card.eventUnavailable')}
          </p>
          <Badge variant={getOrderStatusBadgeVariant(order.status)} size="sm">
            {t(`status.${order.status}`)}
          </Badge>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 text-sm text-on-surface-variant sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
          <p className="flex min-w-0 items-start gap-2">
            <Ticket className="mt-0.5 size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
            <span className="min-w-0">
              <span className="sr-only">{t('card.ticket')}: </span>
              <span className="font-medium text-on-surface">{order.ticketName}</span>
              <span className="px-1.5 text-outline-variant" aria-hidden>
                ·
              </span>
              {t('card.quantityValue', { count: order.quantity })}
            </span>
          </p>
          <p className="flex min-w-0 items-start gap-2">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
            <span>
              <span className="sr-only">{t('card.orderedAt')}: </span>
              <time dateTime={String(order.createdAt)}>{orderDate}</time>
            </span>
          </p>
          {eventDate ? (
            <p className="flex min-w-0 items-start gap-2">
              <ReceiptText className="mt-0.5 size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
              <span>
                <span className="sr-only">{t('card.eventDate')}: </span>
                <time dateTime={String(order.eventStartsAt)}>{eventDate}</time>
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <dl className="flex items-center justify-between gap-4 border-t border-hairline/25 pt-4 lg:min-w-36 lg:flex-col lg:items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
        <div className="min-w-0">
          <dt className="font-label text-xs tracking-label-sm text-on-surface-variant">
            {t('card.total')}
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold tracking-tight text-on-surface">
            {formatCurrency(order.amount, {
              locale: i18n.language,
              fallback: t('card.unavailable'),
              options: { maximumFractionDigits: 0 },
            })}
          </dd>
        </div>
        <span
          className={cn(
            'font-mono text-xs text-on-surface-variant',
            'max-w-28 truncate text-right lg:max-w-36'
          )}
          title={order.documentId}
        >
          {t('card.reference', { reference: order.documentId.slice(-8) })}
        </span>
      </dl>
    </article>
  )
}
