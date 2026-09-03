import { HttpException, HttpStatus } from '@nestjs/common'
import { AUTH_ERROR_CODE, RATE_LIMIT_ERROR_CODE } from '@repo/i18n'
import { USER_ROLE } from '@repo/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  OWNER_REGISTRATION_MAX_ATTEMPTS_PER_DAY,
  PASSWORD_RESET_MAX_ATTEMPTS_PER_DAY,
  USER_REGISTRATION_MAX_ATTEMPTS_PER_DAY,
} from '../auth.constants.ts'
import { ForgotPasswordUseCase } from './forgot-password.use-case.ts'
import { RequestOwnerRegistrationUseCase } from './request-owner-registration.use-case.ts'
import { RequestUserRegistrationUseCase } from './request-user-registration.use-case.ts'

const {
  accountExistsByEmail,
  countOwnerRegistrationTokensForEmailSince,
  countPasswordResetTokensForAccountSince,
  countUserRegistrationTokensForEmailSince,
  createOwnerRegistrationToken,
  createPasswordResetToken,
  createUserRegistrationToken,
  findAuthAccountByEmail,
  hashValue,
  invalidatePendingOwnerRegistrationTokensForEmail,
  invalidatePendingPasswordResetTokensForAccount,
  invalidatePendingUserRegistrationTokensForEmail,
} = vi.hoisted(() => ({
  accountExistsByEmail: vi.fn(),
  countOwnerRegistrationTokensForEmailSince: vi.fn(),
  countPasswordResetTokensForAccountSince: vi.fn(),
  countUserRegistrationTokensForEmailSince: vi.fn(),
  createOwnerRegistrationToken: vi.fn(),
  createPasswordResetToken: vi.fn(),
  createUserRegistrationToken: vi.fn(),
  findAuthAccountByEmail: vi.fn(),
  hashValue: vi.fn(),
  invalidatePendingOwnerRegistrationTokensForEmail: vi.fn(),
  invalidatePendingPasswordResetTokensForAccount: vi.fn(),
  invalidatePendingUserRegistrationTokensForEmail: vi.fn(),
}))

vi.mock('@repo/db', () => ({
  accountExistsByEmail,
  countOwnerRegistrationTokensForEmailSince,
  countPasswordResetTokensForAccountSince,
  countUserRegistrationTokensForEmailSince,
  createOwnerRegistrationToken,
  createPasswordResetToken,
  createUserRegistrationToken,
  findAuthAccountByEmail,
  invalidatePendingOwnerRegistrationTokensForEmail,
  invalidatePendingPasswordResetTokensForAccount,
  invalidatePendingUserRegistrationTokensForEmail,
}))
vi.mock('../../common', () => ({ hashValue }))

const REGISTER_INPUT = {
  name: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.test',
  password: 'password1',
}

function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function expectDomainTooManyRequests(
  error: unknown,
  translateError: ReturnType<typeof vi.fn>,
  expectedCode: string
) {
  expect(error).toBeInstanceOf(HttpException)
  const exception = error as HttpException
  expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
  expect(exception.getResponse()).toBe(expectedCode)
  expect(translateError).toHaveBeenCalledWith(expectedCode)
  expect(translateError).not.toHaveBeenCalledWith(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
}

describe('persisted daily auth rate limits (RF-8)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    accountExistsByEmail.mockResolvedValue(false)
    hashValue.mockResolvedValue('hashed-password')
    createUserRegistrationToken.mockResolvedValue({ id: 1 })
    createOwnerRegistrationToken.mockResolvedValue({ id: 1 })
    createPasswordResetToken.mockResolvedValue({ id: 1 })
    findAuthAccountByEmail.mockResolvedValue({
      account: { id: 7, email: 'ada@example.test', password: 'stored-hash' },
      role: { name: USER_ROLE.USER },
    })
  })

  test('keeps daily registration and recovery caps at 10', () => {
    expect(USER_REGISTRATION_MAX_ATTEMPTS_PER_DAY).toBe(10)
    expect(OWNER_REGISTRATION_MAX_ATTEMPTS_PER_DAY).toBe(10)
    expect(PASSWORD_RESET_MAX_ATTEMPTS_PER_DAY).toBe(10)
    expect(AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED).not.toBe(
      RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS
    )
    expect(AUTH_ERROR_CODE.PASSWORD_RESET_RATE_LIMITED).not.toBe(
      RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS
    )
  })

  test('user registration 429 stays auth.USER_REGISTRATION_RATE_LIMITED after 10 persisted attempts', async () => {
    countUserRegistrationTokensForEmailSince.mockResolvedValue(10)
    const translateError = vi.fn((code: string) => code)
    const useCase = new RequestUserRegistrationUseCase(
      { signAsync: vi.fn() } as never,
      { translateError } as never,
      { execute: vi.fn() } as never
    )

    const error = await useCase.execute(REGISTER_INPUT).catch((caught: unknown) => caught)

    expectDomainTooManyRequests(
      error,
      translateError,
      AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED
    )
    expect(countUserRegistrationTokensForEmailSince).toHaveBeenCalledWith(
      REGISTER_INPUT.email,
      startOfUtcDay()
    )
    expect(createUserRegistrationToken).not.toHaveBeenCalled()
  })

  test('user registration still creates a token when persisted daily count is below 10', async () => {
    countUserRegistrationTokensForEmailSince.mockResolvedValue(9)
    const translateError = vi.fn((code: string) => code)
    const useCase = new RequestUserRegistrationUseCase(
      { signAsync: vi.fn().mockResolvedValue('registration-token') } as never,
      { translateError } as never,
      { execute: vi.fn().mockResolvedValue(undefined) } as never
    )

    await expect(useCase.execute(REGISTER_INPUT)).resolves.toBeUndefined()

    expect(createUserRegistrationToken).toHaveBeenCalled()
    expect(translateError).not.toHaveBeenCalledWith(AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED)
    expect(translateError).not.toHaveBeenCalledWith(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  })

  test('owner registration 429 stays auth.USER_REGISTRATION_RATE_LIMITED after 10 persisted attempts', async () => {
    countOwnerRegistrationTokensForEmailSince.mockResolvedValue(10)
    const translateError = vi.fn((code: string) => code)
    const useCase = new RequestOwnerRegistrationUseCase(
      { signAsync: vi.fn() } as never,
      { translateError } as never,
      { execute: vi.fn() } as never
    )

    const error = await useCase.execute(REGISTER_INPUT).catch((caught: unknown) => caught)

    expectDomainTooManyRequests(
      error,
      translateError,
      AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED
    )
    expect(countOwnerRegistrationTokensForEmailSince).toHaveBeenCalledWith(
      REGISTER_INPUT.email,
      startOfUtcDay()
    )
    expect(createOwnerRegistrationToken).not.toHaveBeenCalled()
  })

  test('password recovery 429 stays auth.PASSWORD_RESET_RATE_LIMITED after 10 persisted attempts', async () => {
    countPasswordResetTokensForAccountSince.mockResolvedValue(10)
    const translateError = vi.fn((code: string) => code)
    const useCase = new ForgotPasswordUseCase(
      { signAsync: vi.fn() } as never,
      { translateError } as never,
      { execute: vi.fn() } as never
    )

    const error = await useCase
      .execute({ email: 'ada@example.test' })
      .catch((caught: unknown) => caught)

    expectDomainTooManyRequests(error, translateError, AUTH_ERROR_CODE.PASSWORD_RESET_RATE_LIMITED)
    expect(countPasswordResetTokensForAccountSince).toHaveBeenCalledWith(7, startOfUtcDay())
    expect(createPasswordResetToken).not.toHaveBeenCalled()
  })

  test('password recovery still creates a token when persisted daily count is below 10', async () => {
    countPasswordResetTokensForAccountSince.mockResolvedValue(9)
    const translateError = vi.fn((code: string) => code)
    const useCase = new ForgotPasswordUseCase(
      { signAsync: vi.fn().mockResolvedValue('reset-token') } as never,
      { translateError } as never,
      { execute: vi.fn().mockResolvedValue(undefined) } as never
    )

    await expect(useCase.execute({ email: 'ada@example.test' })).resolves.toBeUndefined()

    expect(createPasswordResetToken).toHaveBeenCalled()
    expect(translateError).not.toHaveBeenCalledWith(AUTH_ERROR_CODE.PASSWORD_RESET_RATE_LIMITED)
    expect(translateError).not.toHaveBeenCalledWith(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  })
})
