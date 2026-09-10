import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { TranslationService } from '@repo/i18n/server'

const envState = vi.hoisted(() => ({
  MAIL_FROM: 'no-reply@example.test',
}))

vi.mock('../../../../config/env', () => ({
  ENV: envState,
}))

import { MailConfigService } from './mail-config.service.ts'

const translationService = {
  translateError: (code: string) => code,
} as TranslationService

describe('MailConfigService', () => {
  beforeEach(() => {
    envState.MAIL_FROM = 'no-reply@example.test'
  })

  test('isConfigured is true when MAIL_FROM is non-empty', () => {
    const service = new MailConfigService(translationService)

    expect(service.isConfigured()).toBe(true)
  })

  test('isConfigured is false when MAIL_FROM is empty', () => {
    envState.MAIL_FROM = ''
    const service = new MailConfigService(translationService)

    expect(service.isConfigured()).toBe(false)
  })

  test('isConfigured is false when MAIL_FROM is whitespace only', () => {
    envState.MAIL_FROM = '   '
    const service = new MailConfigService(translationService)

    expect(service.isConfigured()).toBe(false)
  })
})
