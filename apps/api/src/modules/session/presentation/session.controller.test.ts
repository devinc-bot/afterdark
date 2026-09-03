import { expect, test } from 'vitest'
import { CLIENT_APP, USER_ROLE, type JwtPayload } from '@repo/types'
import { SessionController } from './session.controller.ts'

const USER: JwtPayload = {
  sub: '1dbd7dc5-61ff-4e3d-b3b0-078aa18e2c37',
  email: 'user@example.com',
  role: USER_ROLE.USER,
  sessionDocumentId: '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7',
}

test('derives the client app from every signed role for session list and revocation', async () => {
  const listCalls: unknown[][] = []
  const revokeCalls: unknown[][] = []
  const controller = new SessionController(
    { execute: async () => undefined } as never,
    { execute: async (...args: unknown[]) => listCalls.push(args) } as never,
    { execute: async (...args: unknown[]) => revokeCalls.push(args) } as never
  )

  const roles = [
    [USER_ROLE.USER, CLIENT_APP.WEB],
    [USER_ROLE.OWNER, CLIENT_APP.DASHBOARD],
    [USER_ROLE.STAFF, CLIENT_APP.DASHBOARD],
  ] as const

  for (const [role, clientApp] of roles) {
    const user = { ...USER, role }
    await controller.list(user)
    await controller.revoke(user, 'fc1598c2-3a5f-49e5-815f-5ddb609252d8')
    expect(listCalls).toContainEqual([user, clientApp])
    expect(revokeCalls).toContainEqual([user, clientApp, 'fc1598c2-3a5f-49e5-815f-5ddb609252d8'])
  }
})

test('revokes an administrator session through the admin client app', async () => {
  const revokeCalls: unknown[][] = []
  const controller = new SessionController(
    { execute: async () => undefined } as never,
    { execute: async () => undefined } as never,
    { execute: async (...args: unknown[]) => revokeCalls.push(args) } as never
  )
  const admin = { ...USER, role: USER_ROLE.ADMIN }
  const documentId = 'fc1598c2-3a5f-49e5-815f-5ddb609252d8'

  await controller.revoke(admin, documentId)

  expect(revokeCalls).toEqual([[admin, CLIENT_APP.ADMIN, documentId]])
})
