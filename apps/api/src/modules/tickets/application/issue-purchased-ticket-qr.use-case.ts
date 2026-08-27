import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  findPurchasedTicketByDocumentIdAndUserDocumentId,
  updateTicketSoldQrCodeByDocumentId,
} from '@repo/db'
import { TICKET_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import type { PurchasedTicketQrResponse } from '@repo/types'
import { TICKET_QR_TOKEN_TTL_MINUTES } from '../../auth/auth.constants'
import { toPurchasedTicketResponse } from '../mappers/tickets.mapper'

const TICKET_QR_TTL_SECONDS = TICKET_QR_TOKEN_TTL_MINUTES * 60

@Injectable()
export class IssuePurchasedTicketQrUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    userDocumentId: string,
    ticketSoldDocumentId: string
  ): Promise<PurchasedTicketQrResponse> {
    try {
      const row = await findPurchasedTicketByDocumentIdAndUserDocumentId({
        userDocumentId,
        ticketSoldDocumentId,
      })

      if (!row) {
        throw new NotFoundException(this.ts.translateError(TICKET_ERROR_CODE.NOT_FOUND))
      }

      const expiresAt = new Date(Date.now() + TICKET_QR_TTL_SECONDS * 1000)
      const token = await this.jwtService.signAsync(
        {
          userId: userDocumentId,
          ticketSoldId: row.ticketSold.documentId,
          eventId: row.event.documentId,
        },
        { expiresIn: TICKET_QR_TTL_SECONDS }
      )
      await updateTicketSoldQrCodeByDocumentId({
        ticketSoldDocumentId: row.ticketSold.documentId,
        qrCode: token,
      })

      return {
        token,
        expiresAt,
        ticket: toPurchasedTicketResponse(
          row.ticketSold,
          row.ticketType,
          row.event,
          row.location,
          null
        ),
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error

      throw new InternalServerErrorException(this.ts.translateError(TICKET_ERROR_CODE.LIST_FAILED))
    }
  }
}
