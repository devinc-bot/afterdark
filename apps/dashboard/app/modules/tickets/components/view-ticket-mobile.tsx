import { cn } from '@afterdark/ui'
import { Home, Ticket, User } from 'lucide-react'
import QRCode from 'react-qr-code'

export type MobileTicketTemplate = {
  clubName?: string
  ticketTypeLabel?: string
  price?: number
  validityLabel?: string
  benefits?: string[]
}

const TICKET_PREVIEW_COPY = {
  notLoadedTitle: 'Ticket no cargado',
  notLoadedDescription:
    'Completá los campos del formulario para ver cómo se verá el ticket en la app.',
  pendingValue: 'Pendiente',
  noBenefits: 'Sin beneficios cargados',
} as const

/** Valor ficticio del QR en la vista previa móvil (no es un ticket real). */
const MOBILE_TICKET_PREVIEW_QR_VALUE = 'preview-ticket'

function isTicketPreviewReady(ticket?: MobileTicketTemplate | null): boolean {
  if (!ticket) return false

  const hasBenefits = Boolean(ticket.benefits?.some((benefit) => benefit.trim().length > 0))
  const hasPrice = ticket.price !== undefined && !Number.isNaN(ticket.price) && ticket.price > 0

  return Boolean(
    ticket.clubName?.trim() ||
    ticket.ticketTypeLabel?.trim() ||
    hasPrice ||
    ticket.validityLabel?.trim() ||
    hasBenefits
  )
}

function formatTicketPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function displayText(value: string | undefined): string {
  return value?.trim() || TICKET_PREVIEW_COPY.pendingValue
}

function displayPrice(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value) || value <= 0) {
    return TICKET_PREVIEW_COPY.pendingValue
  }

  return formatTicketPrice(value)
}

function TicketField({
  label,
  value,
  valueClassName,
  isPlaceholder = false,
}: {
  label: string
  value: string
  valueClassName?: string
  isPlaceholder?: boolean
}) {
  return (
    <div className="min-w-0">
      <p className="font-label text-[10px] font-semibold uppercase tracking-label-xs text-ink-muted-soft">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-heading text-base font-semibold leading-snug',
          isPlaceholder ? 'text-ink-muted-soft' : 'text-ink',
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  )
}

function TicketTearDivider() {
  return (
    <div className="relative px-1.5">
      <div className="border-t border-dashed border-hairline" />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-background"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-background"
      />
    </div>
  )
}

function TicketQrCode({ value }: { value: string }) {
  return (
    <div className="flex justify-center px-4" role="img" aria-label="Código QR del ticket">
      <div className="rounded-lg bg-white p-3">
        <QRCode value={value} size={128} level="M" fgColor="#131314" bgColor="#ffffff" />
      </div>
    </div>
  )
}

function TicketNotLoadedState() {
  return (
    <article className="mx-1.5 overflow-hidden rounded-2xl border border-dashed border-hairline bg-surface-container/60">
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-ink-muted-soft">
          <Ticket aria-hidden="true" className="size-6" />
        </div>
        <p className="mt-4 font-heading text-lg font-semibold text-ink">
          {TICKET_PREVIEW_COPY.notLoadedTitle}
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          {TICKET_PREVIEW_COPY.notLoadedDescription}
        </p>
      </div>
    </article>
  )
}

function MobileTicketCard({ ticket }: { ticket: MobileTicketTemplate }) {
  const clubName = displayText(ticket.clubName)
  const ticketTypeLabel = displayText(ticket.ticketTypeLabel)
  const validityLabel = displayText(ticket.validityLabel)
  const priceLabel = displayPrice(ticket.price)
  const benefits = ticket.benefits?.map((benefit) => benefit.trim()).filter(Boolean) ?? []

  return (
    <article className="mx-1.5 overflow-hidden rounded-2xl border border-hairline bg-surface-container">
      <div className="px-5 py-6 text-center">
        <p
          className={cn(
            'truncate font-heading text-lg font-bold uppercase tracking-wide',
            clubName === TICKET_PREVIEW_COPY.pendingValue
              ? 'text-ink-muted-soft'
              : 'bg-linear-to-r from-ink via-primary to-ink bg-clip-text text-transparent'
          )}
        >
          {clubName}
        </p>
        <p className="mt-2 font-label text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-muted-soft">
          Pase de entrada oficial
        </p>
      </div>

      <TicketTearDivider />

      <div className="space-y-5 px-5 py-6">
        <TicketField
          label="Tipo de entrada"
          value={ticketTypeLabel}
          isPlaceholder={ticketTypeLabel === TICKET_PREVIEW_COPY.pendingValue}
        />

        <div className="flex items-end justify-between gap-4">
          <TicketField
            label="Precio unitario"
            value={priceLabel}
            isPlaceholder={priceLabel === TICKET_PREVIEW_COPY.pendingValue}
          />
          <div className="text-right">
            <TicketField
              label="Validez"
              value={validityLabel}
              isPlaceholder={validityLabel === TICKET_PREVIEW_COPY.pendingValue}
            />
          </div>
        </div>

        <div className="border-t border-hairline pt-5">
          <p className="font-label text-[10px] font-semibold uppercase tracking-label-xs text-ink-muted-soft">
            Beneficios incluidos
          </p>
          {benefits.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-primary">
                    •
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted-soft">{TICKET_PREVIEW_COPY.noBenefits}</p>
          )}
        </div>
      </div>

      <div className="relative bg-linear-to-b from-surface-container-high to-surface-container px-4 py-5">
        <span
          aria-hidden="true"
          className="absolute -top-3 left-0 size-6 rounded-full bg-background"
        />
        <span
          aria-hidden="true"
          className="absolute -top-3 right-0 size-6 rounded-full bg-background"
        />
        <TicketQrCode value={MOBILE_TICKET_PREVIEW_QR_VALUE} />
      </div>
    </article>
  )
}

const mobileIconClassName = 'size-7 shrink-0'
const mobilePreviewRootClassName = 'mx-auto max-w-[18rem]'

function MobileBottomNav() {
  return (
    <nav
      aria-label="Navegación móvil de vista previa"
      className="mt-0 border-t border-hairline bg-surface-container-lowest px-8 py-4"
    >
      <div className="flex items-center justify-between">
        <button type="button" className="text-ink-muted" aria-label="Inicio" tabIndex={-1}>
          <Home aria-hidden="true" className={mobileIconClassName} />
        </button>
        <button
          type="button"
          className="rounded-full border border-primary/50 bg-primary/10 p-3 text-primary shadow-primary-glow"
          aria-label="Tickets"
          aria-current="page"
          tabIndex={-1}
        >
          <Ticket aria-hidden="true" className={mobileIconClassName} />
        </button>
        <button type="button" className="text-ink-muted" aria-label="Perfil" tabIndex={-1}>
          <User aria-hidden="true" className={mobileIconClassName} />
        </button>
      </div>
    </nav>
  )
}

export function ViewTicketMobile({
  ticket,
  className,
}: {
  ticket?: MobileTicketTemplate | null
  className?: string
}) {
  const isReady = isTicketPreviewReady(ticket)

  return (
    <div
      className={cn(mobilePreviewRootClassName, className)}
      aria-label="Vista previa móvil del ticket"
    >
      <div className="rounded-[2.5rem] border border-hairline bg-black p-2 shadow-glass">
        <div className="overflow-hidden rounded-4xl bg-background">
          <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-surface-container-highest" />

          <div className="flex flex-col">
            <header className="px-4 py-4 text-center">
              <p className="font-sans text-sm font-medium text-ink">Evento Detalles</p>
            </header>

            <div className="flex flex-col gap-4 pb-4 pt-2">
              {isReady && ticket ? <MobileTicketCard ticket={ticket} /> : <TicketNotLoadedState />}
            </div>

            <MobileBottomNav />

            <div className="mx-auto mb-2 mt-1 h-1 w-28 rounded-full bg-surface-container-highest" />
          </div>
        </div>
      </div>
    </div>
  )
}
