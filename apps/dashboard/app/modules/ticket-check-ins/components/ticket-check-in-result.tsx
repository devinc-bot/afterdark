import type { TicketCheckInResponse } from '@repo/types'
import { Button, cn } from '@repo/ui'
import { CalendarDays, Check, CircleAlert, Clock3, ScanLine, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  TICKET_SCANNER_STATE,
  type TicketScannerState,
} from '../constants/ticket-check-in.constants'

type TicketCheckInResultProps = {
  state: TicketScannerState
  result?: TicketCheckInResponse
  onScanNext: () => void
}

type ResultCopy = {
  title: string
  icon: typeof Check
  tone: string
}

function formatDateTime(value: Date, language: string): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className="break-words text-base font-medium text-ink">{value}</dd>
    </div>
  )
}

export function TicketCheckInResult({ state, result, onScanNext }: TicketCheckInResultProps) {
  const { t, i18n } = useTranslation('tickets')

  const resultCopy: Record<string, ResultCopy> = {
    [TICKET_SCANNER_STATE.SUCCESS]: {
      title: t('checkIn.success'),
      icon: Check,
      tone: 'bg-success/15 text-success',
    },
    [TICKET_SCANNER_STATE.INVALID]: {
      title: t('checkIn.invalid'),
      icon: CircleAlert,
      tone: 'bg-error/15 text-error',
    },
    [TICKET_SCANNER_STATE.EXPIRED]: {
      title: t('checkIn.expired'),
      icon: Clock3,
      tone: 'bg-tertiary-container/20 text-tertiary-container',
    },
    [TICKET_SCANNER_STATE.USED]: {
      title: t('checkIn.used'),
      icon: CircleAlert,
      tone: 'bg-tertiary-container/20 text-tertiary-container',
    },
  }

  const copy = resultCopy[state] ?? resultCopy[TICKET_SCANNER_STATE.INVALID]
  const Icon = copy.icon
  const isSuccess = state === TICKET_SCANNER_STATE.SUCCESS && result
  const fallback = t('checkIn.notProvided')

  return (
    <section
      className="overflow-hidden rounded-app bg-surface-card"
      role={isSuccess ? 'status' : 'alert'}
      aria-live="assertive"
      aria-atomic="true"
    >
      <header className="flex flex-col items-center gap-4 px-5 py-8 text-center sm:px-8">
        <span className={cn('grid size-12 place-items-center rounded-full', copy.tone)}>
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <h2 className="max-w-lg text-balance font-heading text-xl font-semibold text-ink sm:text-2xl">
          {copy.title}
        </h2>
      </header>

      {isSuccess ? (
        <div className="border-t border-hairline">
          <section className="space-y-5 px-5 py-6 sm:px-8" aria-labelledby="check-in-event">
            <h3
              id="check-in-event"
              className="flex items-center gap-2 font-heading text-lg font-semibold text-ink"
            >
              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
              {t('checkIn.eventSection')}
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label={t('checkIn.fields.event')} value={result.event.name} />
              <Detail
                label={t('checkIn.fields.dateTime')}
                value={formatDateTime(result.event.startsAt, i18n.language)}
              />
              <Detail label={t('checkIn.fields.location')} value={result.location.name} />
              <Detail label={t('checkIn.fields.ticket')} value={result.ticket.name} />
              <Detail
                label={t('checkIn.fields.ticketType')}
                value={result.ticket.type === 'vip' ? t('form.typeVip') : t('form.typeGeneral')}
              />
              <Detail
                label={t('checkIn.fields.checkedInAt')}
                value={formatDateTime(result.checkedInAt, i18n.language)}
              />
            </dl>
          </section>

          <section
            className="space-y-5 border-t border-hairline px-5 py-6 sm:px-8"
            aria-labelledby="check-in-purchaser"
          >
            <h3
              id="check-in-purchaser"
              className="flex items-center gap-2 font-heading text-lg font-semibold text-ink"
            >
              <UserRound className="size-5 text-primary" aria-hidden="true" />
              {t('checkIn.purchaserSection')}
            </h3>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label={t('checkIn.fields.purchaser')} value={result.purchaser.fullName} />
              <Detail label={t('checkIn.fields.email')} value={result.purchaser.email} />
              <Detail
                label={t('checkIn.fields.phone')}
                value={result.purchaser.phone || fallback}
              />
            </dl>
          </section>
        </div>
      ) : null}

      <footer className="border-t border-hairline px-5 py-5 sm:px-8">
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={onScanNext}
          iconLeft={<ScanLine aria-hidden="true" />}
          autoFocus
        >
          {t('checkIn.scanNext')}
        </Button>
      </footer>
    </section>
  )
}
