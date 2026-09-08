import { AUTH_OAUTH_APP, CLIENT_APP, USER_ROLE } from '@repo/types'
import { expect, test } from 'vitest'
import { googleOauthStartSchema, sessionClientAppSchema } from '../src/auth.ts'

test('accepts each supported client app for session operations', () => {
  expect(sessionClientAppSchema.parse({ app: CLIENT_APP.WEB })).toEqual({ app: CLIENT_APP.WEB })
  expect(sessionClientAppSchema.parse({ app: CLIENT_APP.DASHBOARD })).toEqual({
    app: CLIENT_APP.DASHBOARD,
  })
  expect(sessionClientAppSchema.parse({ app: CLIENT_APP.ADMIN })).toEqual({ app: CLIENT_APP.ADMIN })
})

test('rejects an unsupported client app for session operations', () => {
  expect(sessionClientAppSchema.safeParse({ app: 'mobile' }).success).toBe(false)
})

const WEB_START = { app: AUTH_OAUTH_APP.WEB, role: USER_ROLE.USER }
const DASHBOARD_START = { app: AUTH_OAUTH_APP.DASHBOARD, role: USER_ROLE.OWNER }

function isLegalAccepted(input: Record<string, unknown>) {
  const parsed = googleOauthStartSchema.parse(input) as { legalAccepted?: boolean }
  return parsed.legalAccepted === true
}

test('keeps Google start role and app pairing', () => {
  expect(googleOauthStartSchema.parse(WEB_START)).toMatchObject(WEB_START)
  expect(googleOauthStartSchema.parse(DASHBOARD_START)).toMatchObject(DASHBOARD_START)
  expect(
    googleOauthStartSchema.safeParse({ app: AUTH_OAUTH_APP.WEB, role: USER_ROLE.OWNER }).success
  ).toBe(false)
  expect(
    googleOauthStartSchema.safeParse({ app: AUTH_OAUTH_APP.DASHBOARD, role: USER_ROLE.USER })
      .success
  ).toBe(false)
  expect(
    googleOauthStartSchema.safeParse({
      ...WEB_START,
      role: USER_ROLE.OWNER,
      legalAccepted: 'true',
    }).success
  ).toBe(false)
})

test('treats only true as Google start legalAccepted', () => {
  expect(isLegalAccepted(WEB_START)).toBe(false)
  expect(isLegalAccepted({ ...WEB_START, legalAccepted: 'true' })).toBe(true)
  expect(isLegalAccepted({ ...DASHBOARD_START, legalAccepted: true })).toBe(true)
  expect(isLegalAccepted({ ...WEB_START, legalAccepted: 'false' })).toBe(false)
  expect(isLegalAccepted({ ...WEB_START, legalAccepted: false })).toBe(false)
  expect(isLegalAccepted({ ...WEB_START, legalAccepted: 'TRUE' })).toBe(false)
  expect(isLegalAccepted({ ...WEB_START, legalAccepted: '1' })).toBe(false)
})
