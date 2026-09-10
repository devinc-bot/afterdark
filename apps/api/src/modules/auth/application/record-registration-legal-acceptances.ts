import { NotFoundException } from '@nestjs/common'
import { findLatestPublishedLegalDocumentByType, insertAccountLegalAcceptances } from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import type { TranslationService } from '@repo/i18n/server'
import { LEGAL_DOCUMENT_TYPE, type LegalDocumentType } from '@repo/types'

export const USER_REGISTRATION_LEGAL_DOCUMENT_TYPES = [
  LEGAL_DOCUMENT_TYPE.TERMS_WEB,
  LEGAL_DOCUMENT_TYPE.PRIVACY_WEB,
] as const

export const OWNER_REGISTRATION_LEGAL_DOCUMENT_TYPES = [
  LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD,
  LEGAL_DOCUMENT_TYPE.PRIVACY_DASHBOARD,
] as const

type RegistrationLegalDocumentTypes = readonly [LegalDocumentType, LegalDocumentType]

export async function findPublishedRegistrationDocumentIds(
  types: RegistrationLegalDocumentTypes
): Promise<[number, number] | null> {
  const [terms, privacy] = await Promise.all([
    findLatestPublishedLegalDocumentByType(types[0]),
    findLatestPublishedLegalDocumentByType(types[1]),
  ])

  if (!terms || !privacy) {
    return null
  }

  return [terms.id, privacy.id]
}

export async function loadPublishedRegistrationDocumentIds(
  ts: TranslationService,
  types: RegistrationLegalDocumentTypes
): Promise<[number, number]> {
  const legalDocumentIds = await findPublishedRegistrationDocumentIds(types)

  if (!legalDocumentIds) {
    throw new NotFoundException(ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.PUBLISHED_NOT_FOUND))
  }

  return legalDocumentIds
}

export async function recordRegistrationLegalAcceptances(
  ts: TranslationService,
  accountId: number,
  types: RegistrationLegalDocumentTypes
): Promise<void> {
  const legalDocumentIds = await loadPublishedRegistrationDocumentIds(ts, types)
  await insertAccountLegalAcceptances({ accountId, legalDocumentIds })
}
