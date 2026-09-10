import { findAccountIdByOwnerDocumentId, findAccountIdByUserDocumentId } from '@repo/db'
import { USER_ROLE, type LegalDocumentType, type UserRole } from '@repo/types'
import {
  OWNER_REGISTRATION_LEGAL_DOCUMENT_TYPES,
  USER_REGISTRATION_LEGAL_DOCUMENT_TYPES,
} from '../../auth/application/record-registration-legal-acceptances.ts'

export function legalDocumentTypesForRole(role: UserRole): readonly LegalDocumentType[] | null {
  if (role === USER_ROLE.USER) {
    return USER_REGISTRATION_LEGAL_DOCUMENT_TYPES
  }

  if (role === USER_ROLE.OWNER) {
    return OWNER_REGISTRATION_LEGAL_DOCUMENT_TYPES
  }

  return null
}

export async function findAccountIdForLegalAudience(
  profileDocumentId: string,
  role: UserRole
): Promise<number | null> {
  if (role === USER_ROLE.USER) {
    return findAccountIdByUserDocumentId(profileDocumentId)
  }

  if (role === USER_ROLE.OWNER) {
    return findAccountIdByOwnerDocumentId(profileDocumentId)
  }

  return null
}
