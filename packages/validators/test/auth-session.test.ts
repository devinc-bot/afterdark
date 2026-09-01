import { CLIENT_APP } from '@repo/types'
import { expect, test } from 'vitest'
import { sessionClientAppSchema } from '../src/auth.ts'

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
