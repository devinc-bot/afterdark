export const AUTH_ERROR_CODE = {
  USER_NOT_FOUND: 'auth.USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'auth.INVALID_CREDENTIALS',
  EMAIL_ALREADY_REGISTERED: 'auth.EMAIL_ALREADY_REGISTERED',
  UNAUTHORIZED: 'auth.UNAUTHORIZED',
  TOKEN_EXPIRED: 'auth.TOKEN_EXPIRED',
  TOKEN_INVALID: 'auth.TOKEN_INVALID',
  SESSION_NOT_FOUND: 'auth.SESSION_NOT_FOUND',
  REFRESH_TOKEN_INVALID: 'auth.REFRESH_TOKEN_INVALID',
} as const

export const INVITATION_ERROR_CODE = {
  INVITER_NOT_FOUND: 'invitation.INVITER_NOT_FOUND',
  CLUB_NOT_FOUND: 'invitation.CLUB_NOT_FOUND',
  NOT_FOUND: 'invitation.NOT_FOUND',
  FORBIDDEN: 'invitation.FORBIDDEN',
  CREATE_FAILED: 'invitation.CREATE_FAILED',
  LIST_FAILED: 'invitation.LIST_FAILED',
  DELETE_ACCEPTED: 'invitation.DELETE_ACCEPTED',
  DELETE_FAILED: 'invitation.DELETE_FAILED',
  PUBLIC_INVALID: 'invitation.PUBLIC_INVALID',
  PUBLIC_SLUG_MISMATCH: 'invitation.PUBLIC_SLUG_MISMATCH',
  PUBLIC_EXPIRED: 'invitation.PUBLIC_EXPIRED',
  PUBLIC_ALREADY_ACCEPTED: 'invitation.PUBLIC_ALREADY_ACCEPTED',
  PUBLIC_GET_FAILED: 'invitation.PUBLIC_GET_FAILED',
  SECURITY_WORD_INVALID: 'invitation.SECURITY_WORD_INVALID',
  ACCEPT_SUCCESS: 'invitation.ACCEPT_SUCCESS',
  ACCEPT_FAILED: 'invitation.ACCEPT_FAILED',
} as const

export const CLUB_ERROR_CODE = {
  NOT_FOUND: 'club.NOT_FOUND',
  FORBIDDEN: 'club.FORBIDDEN',
  CREATE_FAILED: 'club.CREATE_FAILED',
  UPDATE_FAILED: 'club.UPDATE_FAILED',
  DELETE_FAILED: 'club.DELETE_FAILED',
} as const

export const STAFF_ERROR_CODE = {
  NOT_FOUND: 'staff.NOT_FOUND',
  LIST_FAILED: 'staff.LIST_FAILED',
} as const

export const OWNER_ERROR_CODE = {
  NOT_FOUND: 'owner.NOT_FOUND',
  UPDATE_FAILED: 'owner.UPDATE_FAILED',
} as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE]
export type InvitationErrorCode = (typeof INVITATION_ERROR_CODE)[keyof typeof INVITATION_ERROR_CODE]
export type ClubErrorCode = (typeof CLUB_ERROR_CODE)[keyof typeof CLUB_ERROR_CODE]
export type StaffErrorCode = (typeof STAFF_ERROR_CODE)[keyof typeof STAFF_ERROR_CODE]
export type OwnerErrorCode = (typeof OWNER_ERROR_CODE)[keyof typeof OWNER_ERROR_CODE]

export type ErrorCode =
  | AuthErrorCode
  | InvitationErrorCode
  | ClubErrorCode
  | StaffErrorCode
  | OwnerErrorCode
