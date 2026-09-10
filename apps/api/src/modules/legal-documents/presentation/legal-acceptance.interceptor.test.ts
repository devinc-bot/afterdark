import 'reflect-metadata'
import { Controller, ForbiddenException } from '@nestjs/common'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { LEGAL_DOCUMENT_TYPE, USER_ROLE, type JwtPayload } from '@repo/types'
import { beforeEach, expect, test, vi } from 'vitest'
import { of, lastValueFrom } from 'rxjs'
import { AllowStaleLegalAcceptance } from '../../common/decorators/allow-stale-legal-acceptance.decorator.ts'
import { AuthController } from '../../auth/presentation/auth.controller.ts'
import { SessionController } from '../../session/presentation/session.controller.ts'
import { LegalDocumentsController } from './legal-documents.controller.ts'
import { LegalAcceptanceInterceptor } from './legal-acceptance.interceptor.ts'

const USER_PROFILE_DOCUMENT_ID = '1dbd7dc5-61ff-4e3d-b3b0-078aa18e2c37'
const OWNER_PROFILE_DOCUMENT_ID = '2dbd7dc5-61ff-4e3d-b3b0-078aa18e2c38'
const USER_ACCOUNT_ID = 11
const OWNER_ACCOUNT_ID = 22

const state = vi.hoisted(() => ({
  staleTypes: [] as string[],
  failStale: false,
  userAccountCalls: [] as string[],
  ownerAccountCalls: [] as string[],
}))

vi.mock('@repo/db', () => ({
  findAccountIdByUserDocumentId: async (documentId: string) => {
    state.userAccountCalls.push(documentId)
    if (documentId === USER_PROFILE_DOCUMENT_ID) return USER_ACCOUNT_ID
    return null
  },
  findAccountIdByOwnerDocumentId: async (documentId: string) => {
    state.ownerAccountCalls.push(documentId)
    if (documentId === OWNER_PROFILE_DOCUMENT_ID) return OWNER_ACCOUNT_ID
    return null
  },
  findStaleLegalDocumentTypesForAccount: async () => {
    if (state.failStale) throw new Error('db down')
    return [...state.staleTypes]
  },
}))

@Controller()
class ProbeController {
  @AllowStaleLegalAcceptance()
  allowed() {
    return { ok: true }
  }

  blocked() {
    return { ok: true }
  }
}

const translationService = { translateError: (code: string) => code } as never
const reflector = new Reflector()
const interceptor = new LegalAcceptanceInterceptor(reflector, translationService)
const next: CallHandler = { handle: () => of({ ok: true }) }

const USER: JwtPayload = {
  sub: USER_PROFILE_DOCUMENT_ID,
  email: 'user@example.com',
  role: USER_ROLE.USER,
  sessionDocumentId: '9f2ad9ee-7bb3-4b57-9435-e40ce65193e7',
}

const OWNER: JwtPayload = {
  ...USER,
  sub: OWNER_PROFILE_DOCUMENT_ID,
  role: USER_ROLE.OWNER,
}

function createContext(input: {
  user?: JwtPayload
  handler: (...args: never[]) => unknown
  classRef?: object
}): ExecutionContext {
  return {
    getHandler: () => input.handler,
    getClass: () => input.classRef ?? ProbeController,
    switchToHttp: () => ({
      getRequest: () => ({ user: input.user }),
    }),
  } as unknown as ExecutionContext
}

beforeEach(() => {
  state.staleTypes = []
  state.failStale = false
  state.userAccountCalls.length = 0
  state.ownerAccountCalls.length = 0
})

test('allows anonymous requests without querying acceptances', async () => {
  const result = await interceptor.intercept(
    createContext({ handler: ProbeController.prototype.blocked }),
    next
  )

  expect(await lastValueFrom(result)).toEqual({ ok: true })
  expect(state.userAccountCalls).toEqual([])
  expect(state.ownerAccountCalls).toEqual([])
})

test('allows admin and staff even when documents would be stale', async () => {
  state.staleTypes = [LEGAL_DOCUMENT_TYPE.TERMS_WEB]

  for (const role of [USER_ROLE.ADMIN, USER_ROLE.STAFF] as const) {
    const result = await interceptor.intercept(
      createContext({
        user: { ...USER, role },
        handler: ProbeController.prototype.blocked,
      }),
      next
    )
    expect(await lastValueFrom(result)).toEqual({ ok: true })
  }

  expect(state.userAccountCalls).toEqual([])
})

test('allows a current user', async () => {
  const result = await interceptor.intercept(
    createContext({ user: USER, handler: ProbeController.prototype.blocked }),
    next
  )

  expect(await lastValueFrom(result)).toEqual({ ok: true })
  expect(state.userAccountCalls).toEqual([USER_PROFILE_DOCUMENT_ID])
  expect(state.ownerAccountCalls).toEqual([])
})

test('forbids a stale user with ACCEPTANCE_REQUIRED', async () => {
  state.staleTypes = [LEGAL_DOCUMENT_TYPE.TERMS_WEB]

  await expect(
    interceptor.intercept(
      createContext({ user: USER, handler: ProbeController.prototype.blocked }),
      next
    )
  ).rejects.toMatchObject({
    name: 'ForbiddenException',
    message: LEGAL_DOCUMENT_ERROR_CODE.ACCEPTANCE_REQUIRED,
  })
})

test('forbids a stale owner and resolves the owner profile document id', async () => {
  state.staleTypes = [LEGAL_DOCUMENT_TYPE.TERMS_DASHBOARD]

  await expect(
    interceptor.intercept(
      createContext({ user: OWNER, handler: ProbeController.prototype.blocked }),
      next
    )
  ).rejects.toBeInstanceOf(ForbiddenException)
  expect(state.ownerAccountCalls).toEqual([OWNER_PROFILE_DOCUMENT_ID])
  expect(state.userAccountCalls).toEqual([])
})

test('allows stale user on AllowStaleLegalAcceptance handlers', async () => {
  state.staleTypes = [LEGAL_DOCUMENT_TYPE.PRIVACY_WEB]

  const result = await interceptor.intercept(
    createContext({ user: USER, handler: ProbeController.prototype.allowed }),
    next
  )

  expect(await lastValueFrom(result)).toEqual({ ok: true })
  expect(state.userAccountCalls).toEqual([])
})

test('skips the gate when the profile has no account link', async () => {
  state.staleTypes = [LEGAL_DOCUMENT_TYPE.TERMS_WEB]
  const missing: JwtPayload = { ...USER, sub: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }

  const result = await interceptor.intercept(
    createContext({ user: missing, handler: ProbeController.prototype.blocked }),
    next
  )

  expect(await lastValueFrom(result)).toEqual({ ok: true })
})

test('fails closed with ACCEPTANCE_REQUIRED when the stale query throws', async () => {
  state.failStale = true

  await expect(
    interceptor.intercept(
      createContext({ user: USER, handler: ProbeController.prototype.blocked }),
      next
    )
  ).rejects.toMatchObject({
    name: 'ForbiddenException',
    message: LEGAL_DOCUMENT_ERROR_CODE.ACCEPTANCE_REQUIRED,
  })
})

test('allow-lists refresh, logout, session me, pending GET, and accept POST', () => {
  expect(reflector.get(AllowStaleLegalAcceptance, AuthController.prototype.refresh)).toBeTruthy()
  expect(reflector.get(AllowStaleLegalAcceptance, AuthController.prototype.logout)).toBeTruthy()
  expect(reflector.get(AllowStaleLegalAcceptance, SessionController.prototype.getMe)).toBeTruthy()
  expect(
    reflector.get(AllowStaleLegalAcceptance, LegalDocumentsController.prototype.getPendingAcceptance)
  ).toBeTruthy()
  expect(
    reflector.get(AllowStaleLegalAcceptance, LegalDocumentsController.prototype.accept)
  ).toBeTruthy()
})

test('does not allow-list session list, session revoke, or legal admin routes', () => {
  expect(reflector.get(AllowStaleLegalAcceptance, SessionController.prototype.list)).toBeUndefined()
  expect(reflector.get(AllowStaleLegalAcceptance, SessionController.prototype.revoke)).toBeUndefined()
  expect(reflector.get(AllowStaleLegalAcceptance, LegalDocumentsController.prototype.list)).toBeUndefined()
  expect(reflector.get(AllowStaleLegalAcceptance, LegalDocumentsController.prototype.get)).toBeUndefined()
})
