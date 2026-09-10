import { AUTH_OAUTH_APP, USER_ROLE } from '@repo/types'
import { expect, test } from 'vitest'
import { buildGoogleOauthStartUrl, googleOauthErrorMessageKey } from '../src/utils/google-oauth.ts'

const START_INPUT = {
  role: USER_ROLE.USER,
  app: AUTH_OAUTH_APP.WEB,
  apiUrl: 'http://localhost:3000',
} as const

test('omits legalAccepted from Google start unless it is accepted', () => {
  const loginUrl = new URL(buildGoogleOauthStartUrl(START_INPUT))
  expect(loginUrl.searchParams.get('role')).toBe(USER_ROLE.USER)
  expect(loginUrl.searchParams.get('app')).toBe(AUTH_OAUTH_APP.WEB)
  expect(loginUrl.searchParams.has('legalAccepted')).toBe(false)

  const rejectedUrl = new URL(buildGoogleOauthStartUrl({ ...START_INPUT, legalAccepted: false }))
  expect(rejectedUrl.searchParams.has('legalAccepted')).toBe(false)

  const registerUrl = new URL(buildGoogleOauthStartUrl({ ...START_INPUT, legalAccepted: true }))
  expect(registerUrl.searchParams.get('legalAccepted')).toBe('true')
})

test('maps Google OAuth error query codes to i18n keys', () => {
  expect(googleOauthErrorMessageKey('email_exists')).toBe('google.errors.emailExists')
  expect(googleOauthErrorMessageKey('google_pending_approval')).toBe(
    'google.errors.pendingApproval'
  )
  expect(googleOauthErrorMessageKey('register_required')).toBe('google.errors.registerRequired')
  expect(googleOauthErrorMessageKey('google_failed')).toBe('google.errors.generic')
  expect(googleOauthErrorMessageKey(undefined)).toBe('google.errors.generic')
})
