import { Injectable } from '@nestjs/common'
import { findAuthAccountByEmail, listAccountSessions } from '@repo/db'
import {
  ACCOUNT_SESSION_STATUS,
  type AccountSessionStatus,
  type AccountSessionsResponse,
  type ClientApp,
  type JwtPayload,
} from '@repo/types'

function getLocationLabel(row: {
  city: string | null
  state: string | null
  country: string | null
}) {
  return [row.city, row.state, row.country].filter(Boolean).join(', ') || null
}

export function getAccountSessionStatus(
  revokedAt: Date | null,
  expiresAt: Date,
  now = new Date()
): AccountSessionStatus {
  if (revokedAt) {
    return ACCOUNT_SESSION_STATUS.REVOKED
  }

  return expiresAt > now ? ACCOUNT_SESSION_STATUS.ACTIVE : ACCOUNT_SESSION_STATUS.EXPIRED
}

@Injectable()
export class ListAccountSessionsUseCase {
  async execute(payload: JwtPayload, clientApp: ClientApp): Promise<AccountSessionsResponse> {
    const account = await findAuthAccountByEmail(payload.email)
    if (!account) {
      return { sessions: [] }
    }

    const now = new Date()
    const rows = await listAccountSessions({ accountId: account.account.id, clientApp })
    const sessions = rows.map((row) => ({
      documentId: row.documentId,
      clientApp: row.clientApp,
      device: row.device,
      ipAddress: row.ipAddress,
      locationLabel: getLocationLabel(row),
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      status: getAccountSessionStatus(row.revokedAt, row.expiresAt, now),
      isCurrent: row.documentId === payload.sessionDocumentId,
    }))

    sessions.sort((left, right) => Number(right.isCurrent) - Number(left.isCurrent))
    return { sessions }
  }
}
