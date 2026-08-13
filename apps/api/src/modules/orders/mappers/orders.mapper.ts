import type { OrderSelect } from '@repo/db'
import type {
  BuyerOrderSummaryResponse,
  BuyerOrderSummaryRow,
  OrderResponse,
  PaymentStatus,
} from '@repo/types'

export function toOrderResponse(order: OrderSelect): OrderResponse {
  return {
    documentId: order.documentId,
    ticketId: String(order.ticketId),
    status: order.status as PaymentStatus,
    amount: order.amount,
    quantity: order.quantity,
    provider: order.provider,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

export function toBuyerOrderSummaryResponse(
  order: BuyerOrderSummaryRow
): BuyerOrderSummaryResponse {
  return {
    documentId: order.documentId,
    status: order.status as PaymentStatus,
    amount: order.amount,
    quantity: order.quantity,
    provider: order.provider,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    ticketId: order.ticketId,
    ticketName: order.ticketName,
    ticketType: order.ticketType,
    eventId: order.eventId,
    eventName: order.eventName,
    eventStartsAt: order.eventStartsAt,
  }
}
