import { Calendar, MapPin, QrCode, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, NotImage, cn } from '@repo/ui'
import type { MockTicket } from '../constants/mock-tickets'

type TicketCardProps = {
  ticket: MockTicket
}

function formatTicketWhen(iso: string, locale: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { t, i18n } = useTranslation('tickets')
  const when = formatTicketWhen(ticket.startsAt, i18n.language)
  const statusLabel = ticket.status === 'valid' ? t('mine.status.valid') : t('mine.status.used')
  const isUsed = ticket.status === 'used'

  return (
    <Card
      className={cn(
        'flex h-full w-full cursor-pointer flex-col overflow-hidden border-hairline/15 bg-surface-card',
        'origin-center transition-[transform,border-color,box-shadow] duration-(--duration-fast) ease-emphasized',
        'hover:z-10 hover:scale-[1.02] hover:border-hairline/40 hover:shadow-(--shadow-glass)',
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
        isUsed && 'opacity-85'
      )}
    >
      <div className="m-4 overflow-hidden rounded-app">
        {ticket.coverUrl ? (
          <img src={ticket.coverUrl} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <NotImage
            size="full"
            label={t('mine.card.noCover')}
            className="aspect-video min-h-0 w-full rounded-none border-0 border-b border-hairline/40"
          />
        )}
      </div>

      <CardHeader className="flex flex-1 flex-col gap-3 space-y-0 p-4 pt-0 sm:gap-3.5 sm:p-5 sm:pt-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="font-display text-lg font-semibold tracking-tight text-balance text-on-surface sm:text-xl">
            {ticket.eventName}
          </CardTitle>
          <Badge variant={isUsed ? 'secondary' : 'default'} size="sm" className="shrink-0">
            {statusLabel}
          </Badge>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="flex items-start gap-1.5 text-sm text-on-surface-variant">
              <Calendar
                className="mt-0.5 size-3.5 shrink-0 opacity-70"
                aria-hidden
                strokeWidth={1.75}
              />
              <time dateTime={ticket.startsAt}>{when}</time>
            </p>

            <p className="flex items-start gap-1.5 text-sm text-on-surface-variant">
              <MapPin
                className="mt-0.5 size-3.5 shrink-0 opacity-70"
                aria-hidden
                strokeWidth={1.75}
              />
              <span className="min-w-0 text-pretty">
                <span className="sr-only">{t('mine.card.venue')}: </span>
                {ticket.venue}
              </span>
            </p>

            <dl className="grid gap-2 text-sm text-on-surface-variant sm:grid-cols-2">
              <div className="flex items-start gap-1.5">
                <Ticket
                  className="mt-0.5 size-3.5 shrink-0 opacity-70"
                  aria-hidden
                  strokeWidth={1.75}
                />
                <div className="min-w-0">
                  <dt className="text-xs text-on-surface-variant/80">{t('mine.card.type')}</dt>
                  <dd className="font-medium text-on-surface">{ticket.ticketType}</dd>
                </div>
              </div>
              <div className="min-w-0 pl-5 sm:pl-0">
                <dt className="text-xs text-on-surface-variant/80">{t('mine.card.quantity')}</dt>
                <dd className="font-medium text-on-surface">
                  {t('mine.card.quantityValue', { count: ticket.quantity })}
                </dd>
              </div>
            </dl>
          </div>

          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-app bg-white p-1 text-black sm:size-20"
            role="img"
            aria-label={t('mine.card.qrLabel')}
          >
            <QrCode className="size-full" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-auto border-t border-hairline/20 p-4 pt-4 sm:p-5 sm:pt-4">
        <Button
          type="button"
          variant="default"
          size="lg"
          className="w-full"
          onClick={(event) => event.stopPropagation()}
        >
          <QrCode className="size-4" aria-hidden strokeWidth={1.75} />
          {t('mine.card.openQr')}
        </Button>
      </CardContent>
    </Card>
  )
}
