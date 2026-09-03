import { useState } from 'react'
import { Calendar, MapPin, QrCode, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Card, CardFooter, CardHeader, CardTitle, NotImage, cn } from '@repo/ui'
import type { PurchasedTicketResponse } from '@repo/types'
import { TicketQrDialog } from './ticket-qr-dialog'

type TicketCardProps = {
  ticket: PurchasedTicketResponse
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
  const [qrOpen, setQrOpen] = useState(false)
  const eventStartsAt = String(ticket.eventStartsAt)
  const when = formatTicketWhen(eventStartsAt, i18n.language)
  const statusLabel = ticket.checkedIn ? t('mine.status.used') : t('mine.status.valid')
  const isUsed = ticket.checkedIn

  return (
    <>
      <Card
        className={cn(
          'group relative flex h-full w-full cursor-pointer flex-col overflow-hidden border-hairline/20 bg-surface-card',
          'shadow-none transition-[transform,border-color,box-shadow,background-color] duration-(--duration-fast) ease-emphasized',
          'hover:z-10 hover:-translate-y-1 hover:border-primary/25 hover:bg-surface-high/40 hover:shadow-(--shadow-glass)',
          'active:translate-y-0 active:shadow-none',
          'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
          isUsed && 'border-hairline/10 hover:border-hairline/35'
        )}
      >
        <div className="relative m-4 overflow-hidden rounded-app">
          {ticket.eventImageUrl ? (
            <img
              src={ticket.eventImageUrl}
              alt=""
              className={cn(
                'aspect-video w-full object-cover',
                'transition-transform duration-300 ease-emphasized',
                'group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                isUsed && 'grayscale-[0.45] contrast-[0.92] group-hover:grayscale-[0.2]'
              )}
            />
          ) : (
            <NotImage
              size="full"
              label={t('mine.card.noCover')}
              className="aspect-video min-h-0 w-full rounded-none border-0"
            />
          )}
          <Badge
            variant={isUsed ? 'secondary' : 'default'}
            size="sm"
            className={cn(
              'absolute top-3 right-3 shadow-(--shadow-glass) rounded-app-sm',
              'transition-transform duration-(--duration-fast) ease-emphasized',
              'group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0'
            )}
          >
            {statusLabel}
          </Badge>
        </div>

        <CardHeader className="flex flex-1 flex-col gap-0 space-y-0 p-5 sm:p-6">
          <CardTitle
            className={cn(
              'font-display text-xl font-semibold tracking-tight text-balance text-on-surface sm:text-[1.35rem]',
              'transition-colors duration-(--duration-fast) ease-emphasized',
              'group-hover:text-primary motion-reduce:transition-none'
            )}
          >
            {ticket.eventName}
          </CardTitle>

          <div className="mt-5 flex items-stretch gap-0">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 pr-4 sm:pr-5">
              <p className="flex items-start gap-2 font-body text-sm leading-snug text-on-surface">
                <Calendar
                  className="mt-0.5 size-3.5 shrink-0 text-on-surface-variant"
                  aria-hidden
                  strokeWidth={1.75}
                />
                <time dateTime={eventStartsAt} className="text-pretty">
                  {when}
                </time>
              </p>

              <p className="flex items-start gap-2 text-sm leading-snug text-on-surface-variant">
                <MapPin
                  className="mt-0.5 size-3.5 shrink-0 opacity-80"
                  aria-hidden
                  strokeWidth={1.75}
                />
                <span className="min-w-0 text-pretty">
                  <span className="sr-only">{t('mine.card.venue')}: </span>
                  {ticket.locationName}
                </span>
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hairline/25 pt-3 text-sm">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-on-surface">
                  <Ticket
                    className="size-3.5 shrink-0 text-on-surface-variant"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <span className="sr-only">{t('mine.card.type')}: </span>
                  <span className="font-medium">{ticket.ticketType.name}</span>
                </span>
                <span className="size-1 rounded-full bg-outline-variant/50" aria-hidden />
                <span className="text-on-surface-variant">
                  <span className="sr-only">{t('mine.card.quantity')}: </span>
                  {t('mine.card.quantityValue', { count: 1 })}
                </span>
              </div>
            </div>

            <div className="relative flex shrink-0 flex-col items-center justify-center border-l border-dashed border-hairline/40 pl-4 sm:pl-5">
              <span
                className="absolute -top-1 left-0 size-2.5 -translate-x-1/2 rounded-full bg-background"
                aria-hidden
              />
              <span
                className="absolute -bottom-1 left-0 size-2.5 -translate-x-1/2 rounded-full bg-background"
                aria-hidden
              />
              <div
                className={cn(
                  'flex size-14 items-center justify-center rounded-app-sm bg-white p-1 text-black ring-1 ring-hairline/20 sm:size-16',
                  'transition-[transform,box-shadow,ring-color] duration-(--duration-fast) ease-emphasized',
                  'group-hover:scale-105 group-hover:shadow-(--shadow-glass) group-hover:ring-primary/35',
                  'motion-reduce:transition-none motion-reduce:group-hover:scale-100'
                )}
                role="img"
                aria-label={t('mine.card.qrLabel')}
              >
                <QrCode className="size-full" strokeWidth={1.5} aria-hidden />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="mt-auto border-t border-hairline/20 p-5 pt-4 sm:p-6 sm:pt-4">
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={isUsed}
            className={cn(
              'w-full transition-transform duration-(--duration-fast) ease-emphasized',
              'group-hover:scale-[1.01] motion-reduce:group-hover:scale-100'
            )}
            onClick={(event) => {
              event.stopPropagation()
              setQrOpen(true)
            }}
          >
            <QrCode className="size-4" aria-hidden strokeWidth={1.75} />
            {t('mine.card.openQr')}
          </Button>
        </CardFooter>
      </Card>

      <TicketQrDialog open={qrOpen} onOpenChange={setQrOpen} ticket={ticket} />
    </>
  )
}
