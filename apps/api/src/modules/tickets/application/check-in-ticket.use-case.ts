import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  consumeTicketSoldById,
  findTicketCheckInContextByClaims,
  findTicketCheckInOperatorForLocation,
} from '@repo/db'
import {
  PAYMENT_STATUS,
  TICKET_CHECK_IN_OUTCOME,
  type TicketCheckInResponse,
  type UserRole,
} from '@repo/types'
import { toTicketCheckInResponse } from '../mappers/ticket-check-in.mapper'

type TicketQrClaims = {
  ticketSoldId: string
  eventId: string
  userId: string
  exp: number
}

export type TicketCheckInUseCaseResult =
  | TicketCheckInResponse
  | { outcome: typeof TICKET_CHECK_IN_OUTCOME.INVALID }
  | { outcome: typeof TICKET_CHECK_IN_OUTCOME.EXPIRED }
  | { outcome: typeof TICKET_CHECK_IN_OUTCOME.USED }

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isTicketQrClaims(value: unknown): value is TicketQrClaims {
  if (!value || typeof value !== 'object') return false

  const claims = value as Partial<TicketQrClaims>

  return (
    isNonEmptyString(claims.ticketSoldId) &&
    isNonEmptyString(claims.eventId) &&
    isNonEmptyString(claims.userId) &&
    typeof claims.exp === 'number' &&
    Number.isFinite(claims.exp)
  )
}

function isExpired(expirationSeconds: number, now: Date): boolean {
  return expirationSeconds * 1000 <= now.getTime()
}

@Injectable()
export class CheckInTicketUseCase {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async execute(params: {
    operatorDocumentId: string
    operatorRole: UserRole
    token: string
  }): Promise<TicketCheckInUseCaseResult> {
    let claims: unknown

    try {
      claims = await this.jwtService.verifyAsync(params.token, { ignoreExpiration: true })
    } catch {
      return { outcome: TICKET_CHECK_IN_OUTCOME.INVALID }
    }

    if (!isTicketQrClaims(claims)) {
      return { outcome: TICKET_CHECK_IN_OUTCOME.INVALID }
    }

    const context = await findTicketCheckInContextByClaims({
      ticketSoldDocumentId: claims.ticketSoldId,
      eventDocumentId: claims.eventId,
      userDocumentId: claims.userId,
      token: params.token,
    })

    if (!context || context.order.status !== PAYMENT_STATUS.COMPLETED) {
      return { outcome: TICKET_CHECK_IN_OUTCOME.INVALID }
    }

    const operator = await findTicketCheckInOperatorForLocation({
      operatorDocumentId: params.operatorDocumentId,
      operatorRole: params.operatorRole,
      locationId: context.location.id,
    })

    if (!operator) {
      return { outcome: TICKET_CHECK_IN_OUTCOME.INVALID }
    }

    if (context.ticketSold.checkedIn) {
      return { outcome: TICKET_CHECK_IN_OUTCOME.USED }
    }

    const now = new Date()

    if (isExpired(claims.exp, now)) {
      return { outcome: TICKET_CHECK_IN_OUTCOME.EXPIRED }
    }

    const consumedTicket = await consumeTicketSoldById({
      ticketSoldId: context.ticketSold.id,
      usedAt: now,
      checkedInByAccountId: operator.accountId,
      checkedInByRole: operator.role,
    })

    if (!consumedTicket) {
      return { outcome: TICKET_CHECK_IN_OUTCOME.USED }
    }

    return toTicketCheckInResponse(context, consumedTicket.usedAt)
  }
}
