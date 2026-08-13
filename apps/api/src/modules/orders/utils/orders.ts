import { ENV } from '../../../config/env'

export function arePlatformPaymentsConfigured(): boolean {
  return Boolean(
    ENV.MERCADOPAGO_ACCESS_TOKEN && ENV.MERCADOPAGO_WEBHOOK_SECRET && ENV.API_PUBLIC_URL
  )
}

export function isTicketOnSale(ticket: {
  saleStartsAt: Date | null
  saleEndsAt: Date | null
}): boolean {
  const now = new Date()
  return (
    (!ticket.saleStartsAt || ticket.saleStartsAt <= now) &&
    (!ticket.saleEndsAt || ticket.saleEndsAt >= now)
  )
}
