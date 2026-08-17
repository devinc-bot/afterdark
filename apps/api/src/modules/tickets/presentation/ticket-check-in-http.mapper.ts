import { ConflictException, GoneException, UnprocessableEntityException } from '@nestjs/common'
import { TICKET_ERROR_CODE, type TicketErrorCode } from '@repo/i18n/constants'
import {
  TICKET_CHECK_IN_OUTCOME,
  type TicketCheckInResponse,
  type TicketCheckInOutcome,
} from '@repo/types'
import type { TicketCheckInUseCaseResult } from '../application/check-in-ticket.use-case'

type TranslateTicketError = (code: TicketErrorCode) => string

function throwTicketCheckInError(
  outcome: Exclude<TicketCheckInOutcome, typeof TICKET_CHECK_IN_OUTCOME.SUCCESS>,
  translate: TranslateTicketError
): never {
  if (outcome === TICKET_CHECK_IN_OUTCOME.USED) {
    throw new ConflictException(translate(TICKET_ERROR_CODE.CHECK_IN_USED))
  }

  if (outcome === TICKET_CHECK_IN_OUTCOME.EXPIRED) {
    throw new GoneException(translate(TICKET_ERROR_CODE.CHECK_IN_EXPIRED))
  }

  throw new UnprocessableEntityException(translate(TICKET_ERROR_CODE.CHECK_IN_INVALID))
}

export function toTicketCheckInHttpResponse(
  result: TicketCheckInUseCaseResult,
  translate: TranslateTicketError
): TicketCheckInResponse {
  if (result.outcome === TICKET_CHECK_IN_OUTCOME.SUCCESS) {
    return result
  }

  return throwTicketCheckInError(result.outcome, translate)
}
