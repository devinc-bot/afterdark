import { createHmac, timingSafeEqual } from 'node:crypto'
import { ENV } from '../../../config/env'

const REFRESH_TOKEN_PART_COUNT = 4
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/

export type RefreshTokenPayload = {
  sessionDocumentId: string
  version: number
  secret: string
}

// Refresh credentials stay stateful: the persisted secret hash enables rotation and immediate revocation.
// The MAC authenticates their session and version without turning them into self-contained JWTs.
export function createRefreshTokenMac(payload: RefreshTokenPayload): string {
  return createHmac('sha256', ENV.REFRESH_TOKEN_SECRET)
    .update(`${payload.sessionDocumentId}.${payload.version}.${payload.secret}`)
    .digest('base64url')
}

export function parseAndVerifyRefreshToken(value: string): RefreshTokenPayload | null {
  const parts = value.split('.')
  if (parts.length !== REFRESH_TOKEN_PART_COUNT) {
    return null
  }

  const [sessionDocumentId, versionValue, secret, mac] = parts
  const version = Number(versionValue)
  if (
    !sessionDocumentId ||
    !secret ||
    !mac ||
    !BASE64URL_PATTERN.test(mac) ||
    !Number.isSafeInteger(version) ||
    version < 0
  ) {
    return null
  }

  const expectedMac = createRefreshTokenMac({ sessionDocumentId, version, secret })
  const expectedMacBuffer = Buffer.from(expectedMac, 'base64url')
  const presentedMacBuffer = Buffer.from(mac, 'base64url')
  if (
    expectedMacBuffer.length !== presentedMacBuffer.length ||
    !timingSafeEqual(expectedMacBuffer, presentedMacBuffer)
  ) {
    return null
  }

  return { sessionDocumentId, version, secret }
}
