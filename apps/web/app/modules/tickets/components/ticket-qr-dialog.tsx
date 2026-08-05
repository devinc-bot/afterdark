import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, RefreshCw } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  cn,
} from '@repo/ui'
import type { PurchasedTicketResponse } from '@repo/types'
import { fetchPurchasedTicketQr } from '../services/purchased-tickets.service'

type TicketQrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: Pick<
    PurchasedTicketResponse,
    'documentId' | 'eventName' | 'eventStartsAt' | 'locationName' | 'ticketName'
  >
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

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function TicketTearDivider() {
  return (
    <div className="relative px-1" aria-hidden>
      <div className="border-t border-dashed border-hairline/45" />
      <span className="absolute top-1/2 -left-1 size-2.5 -translate-y-1/2 rounded-full bg-surface-container-high" />
      <span className="absolute top-1/2 -right-1 size-2.5 -translate-y-1/2 rounded-full bg-surface-container-high" />
    </div>
  )
}

export function TicketQrDialog({ open, onOpenChange, ticket }: TicketQrDialogProps) {
  const { t, i18n } = useTranslation('tickets')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['purchased-ticket-qr', ticket.documentId],
    queryFn: () => fetchPurchasedTicketQr(ticket.documentId),
    enabled: open,
  })
  const qrTicket = data?.ticket ?? ticket
  const isExpired = secondsLeft !== null && secondsLeft <= 0
  const isUrgent = !isExpired && secondsLeft !== null && secondsLeft <= 10
  const countdown = secondsLeft === null ? null : formatCountdown(secondsLeft)
  const eventStartsAt = String(qrTicket.eventStartsAt)
  const when = formatTicketWhen(eventStartsAt, i18n.language)

  useEffect(() => {
    if (!open || !data) {
      setSecondsLeft(null)
      return
    }

    const expiresAt = new Date(data.expiresAt).getTime()
    const updateCountdown = () => {
      setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }

    updateCountdown()
    const id = window.setInterval(() => {
      updateCountdown()
    }, 1000)

    return () => window.clearInterval(id)
  }, [data, open])

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" persistent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1.5 px-5 pt-5 pr-12 sm:px-6 sm:pt-6">
          <DialogTitle className="font-display text-xl font-semibold tracking-tight">
            {t('mine.qrDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-pretty">
            {t('mine.qrDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Event meta — tight cluster */}
        <div className="flex flex-col gap-3 px-5 pt-4 sm:px-6">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-balance text-on-surface">
            {qrTicket.eventName}
          </h3>

          <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
            <p className="flex items-start gap-2">
              <Calendar
                className="mt-0.5 size-3.5 shrink-0 opacity-75"
                aria-hidden
                strokeWidth={1.75}
              />
              <span className="sr-only">{t('mine.qrDialog.when')}: </span>
              <time dateTime={eventStartsAt} className="text-pretty text-on-surface">
                {when}
              </time>
            </p>
            <p className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 size-3.5 shrink-0 opacity-75"
                aria-hidden
                strokeWidth={1.75}
              />
              <span className="sr-only">{t('mine.card.venue')}: </span>
              <span className="min-w-0 text-pretty">{qrTicket.locationName}</span>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-hairline/30 pt-3">
            <div className="min-w-0">
              <dt className="font-label text-xs tracking-wide text-on-surface-variant">
                {t('mine.card.type')}
              </dt>
              <dd className="mt-0.5 truncate font-medium text-on-surface">{qrTicket.ticketName}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-label text-xs tracking-wide text-on-surface-variant">
                {t('mine.card.quantity')}
              </dt>
              <dd className="mt-0.5 font-medium tabular-nums text-on-surface">
                {t('mine.card.quantityValue', { count: 1 })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-5 py-4 sm:px-6">
          <TicketTearDivider />
        </div>

        {/* QR hero */}
        <div className="flex flex-col items-center gap-4 px-5 pb-6 sm:px-6">
          {error ? (
            <>
              <div
                className="flex size-[212px] flex-col items-center justify-center gap-3 rounded-app border border-dashed border-hairline/50 bg-surface-muted/50 px-6 text-center"
                role="alert"
              >
                <p className="max-w-[22ch] text-sm text-pretty text-on-surface-variant">
                  {t('mine.qrDialog.error')}
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleRefresh}
              >
                <RefreshCw className="size-4" aria-hidden strokeWidth={1.75} />
                {t('mine.qrDialog.retry')}
              </Button>
            </>
          ) : isFetching || secondsLeft === null ? (
            <div
              className="flex size-[212px] items-center justify-center rounded-app border border-hairline/50 bg-surface-muted/50 px-6 text-center"
              role="status"
            >
              <p className="text-sm text-pretty text-on-surface-variant">
                {t('mine.qrDialog.loading')}
              </p>
            </div>
          ) : isExpired ? (
            <>
              <div
                className="flex size-[212px] flex-col items-center justify-center gap-3 rounded-app border border-dashed border-hairline/50 bg-surface-muted/50 px-6 text-center"
                role="status"
              >
                <p className="max-w-[22ch] text-sm text-pretty text-on-surface-variant">
                  {t('mine.qrDialog.expired')}
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleRefresh}
              >
                <RefreshCw className="size-4" aria-hidden strokeWidth={1.75} />
                {t('mine.qrDialog.refresh')}
              </Button>
            </>
          ) : (
            <>
              <div
                key={data.token}
                className={cn(
                  'rounded-app bg-white p-3.5 shadow-(--shadow-glass)',
                  'animate-in fade-in-0 zoom-in-95 duration-200 ease-emphasized',
                  'motion-reduce:animate-none'
                )}
                role="img"
                aria-label={t('mine.qrDialog.qrAria')}
              >
                <QRCode
                  value={data.token}
                  size={184}
                  level="M"
                  fgColor="#131314"
                  bgColor="#ffffff"
                />
              </div>

              <p
                className={cn(
                  'inline-flex items-center rounded-pill px-3 py-1.5 font-label text-sm font-medium tabular-nums',
                  'transition-colors duration-(--duration-fast) ease-emphasized motion-reduce:transition-none',
                  isUrgent ? 'bg-error/15 text-error' : 'bg-surface-high text-on-surface-variant'
                )}
                aria-live="polite"
                aria-label={t('mine.qrDialog.countdownAria', { time: countdown })}
              >
                {t('mine.qrDialog.countdown', { time: countdown })}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
