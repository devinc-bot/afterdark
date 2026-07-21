export const AUTH_ERROR_CODE = {
  USER_NOT_FOUND: 'auth.USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'auth.INVALID_CREDENTIALS',
  EMAIL_ALREADY_REGISTERED: 'auth.EMAIL_ALREADY_REGISTERED',
  UNAUTHORIZED: 'auth.UNAUTHORIZED',
  TOKEN_EXPIRED: 'auth.TOKEN_EXPIRED',
  TOKEN_INVALID: 'auth.TOKEN_INVALID',
  SESSION_NOT_FOUND: 'auth.SESSION_NOT_FOUND',
  REFRESH_TOKEN_INVALID: 'auth.REFRESH_TOKEN_INVALID',
  PASSWORD_RESET_TOKEN_INVALID: 'auth.PASSWORD_RESET_TOKEN_INVALID',
  PASSWORD_RESET_RATE_LIMITED: 'auth.PASSWORD_RESET_RATE_LIMITED',
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

export const LOCATION_ERROR_CODE = {
  NOT_FOUND: 'location.NOT_FOUND',
  FORBIDDEN: 'location.FORBIDDEN',
  CREATE_FAILED: 'location.CREATE_FAILED',
  UPDATE_FAILED: 'location.UPDATE_FAILED',
  DELETE_FAILED: 'location.DELETE_FAILED',
} as const

export const STAFF_ERROR_CODE = {
  NOT_FOUND: 'staff.NOT_FOUND',
  LIST_FAILED: 'staff.LIST_FAILED',
  UPDATE_FAILED: 'staff.UPDATE_FAILED',
  DELETE_FAILED: 'staff.DELETE_FAILED',
  INVALID_STATUS: 'staff.INVALID_STATUS',
  INACTIVE: 'staff.INACTIVE',
} as const

export const OWNER_ERROR_CODE = {
  NOT_FOUND: 'owner.NOT_FOUND',
  UPDATE_FAILED: 'owner.UPDATE_FAILED',
} as const

export const TICKET_ERROR_CODE = {
  NOT_FOUND: 'ticket.NOT_FOUND',
  FORBIDDEN: 'ticket.FORBIDDEN',
  CLUB_NOT_FOUND: 'ticket.CLUB_NOT_FOUND',
  EVENT_NOT_FOUND: 'ticket.EVENT_NOT_FOUND',
  CREATE_FAILED: 'ticket.CREATE_FAILED',
  UPDATE_FAILED: 'ticket.UPDATE_FAILED',
  DELETE_FAILED: 'ticket.DELETE_FAILED',
  LIST_FAILED: 'ticket.LIST_FAILED',
  HAS_PAYMENTS: 'ticket.HAS_PAYMENTS',
} as const

export const FILE_ERROR_CODE = {
  FILE_REQUIRED: 'file.FILE_REQUIRED',
  INVALID_IMAGE_TYPE: 'file.INVALID_IMAGE_TYPE',
  FILE_TOO_LARGE: 'file.FILE_TOO_LARGE',
  UPLOAD_FAILED: 'file.UPLOAD_FAILED',
  DELETE_FAILED: 'file.DELETE_FAILED',
} as const

export const MAIL_ERROR_CODE = {
  NOT_CONFIGURED: 'mail.NOT_CONFIGURED',
  SEND_FAILED: 'mail.SEND_FAILED',
  RENDER_FAILED: 'mail.RENDER_FAILED',
} as const

export const GUARD_ERROR_CODE = {
  OWNER_ONLY: 'guard.OWNER_ONLY',
  INSUFFICIENT_ROLE: 'guard.INSUFFICIENT_ROLE',
} as const

export const EVENT_ERROR_CODE = {
  NOT_FOUND: 'event.NOT_FOUND',
  CLUB_NOT_FOUND: 'event.CLUB_NOT_FOUND',
  CREATE_FAILED: 'event.CREATE_FAILED',
  UPDATE_FAILED: 'event.UPDATE_FAILED',
  DELETE_FAILED: 'event.DELETE_FAILED',
  LIST_FAILED: 'event.LIST_FAILED',
  HAS_TICKETS: 'event.HAS_TICKETS',
  IMAGE_UPLOAD_FAILED: 'event.IMAGE_UPLOAD_FAILED',
  TOO_MANY_IMAGES: 'event.TOO_MANY_IMAGES',
  INVALID_IMAGE_IDS: 'event.INVALID_IMAGE_IDS',
} as const

export const GEO_ERROR_CODE = {
  PROVIDER_FAILED: 'geo.PROVIDER_FAILED',
  RATE_LIMITED: 'geo.RATE_LIMITED',
} as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE]
export type InvitationErrorCode = (typeof INVITATION_ERROR_CODE)[keyof typeof INVITATION_ERROR_CODE]
export type LocationErrorCode = (typeof LOCATION_ERROR_CODE)[keyof typeof LOCATION_ERROR_CODE]
export type StaffErrorCode = (typeof STAFF_ERROR_CODE)[keyof typeof STAFF_ERROR_CODE]
export type OwnerErrorCode = (typeof OWNER_ERROR_CODE)[keyof typeof OWNER_ERROR_CODE]
export type TicketErrorCode = (typeof TICKET_ERROR_CODE)[keyof typeof TICKET_ERROR_CODE]
export type FileErrorCode = (typeof FILE_ERROR_CODE)[keyof typeof FILE_ERROR_CODE]
export type MailErrorCode = (typeof MAIL_ERROR_CODE)[keyof typeof MAIL_ERROR_CODE]
export type GuardErrorCode = (typeof GUARD_ERROR_CODE)[keyof typeof GUARD_ERROR_CODE]
export type EventErrorCode = (typeof EVENT_ERROR_CODE)[keyof typeof EVENT_ERROR_CODE]
export type GeoErrorCode = (typeof GEO_ERROR_CODE)[keyof typeof GEO_ERROR_CODE]

export type ErrorCode =
  | AuthErrorCode
  | InvitationErrorCode
  | LocationErrorCode
  | StaffErrorCode
  | OwnerErrorCode
  | TicketErrorCode
  | FileErrorCode
  | MailErrorCode
  | GuardErrorCode
  | EventErrorCode
  | GeoErrorCode
