import { expect, test } from 'vitest'
import { API_ERROR_RECORD_FIELD_LIMITS, type CreateApiErrorRecordUnlessRecentInput } from '@repo/db'
import {
  ApiErrorRecorderService,
  type ApiErrorRecordingContext,
} from './api-error-recorder.service.ts'

class TestApiErrorRecorderService extends ApiErrorRecorderService {
  input: CreateApiErrorRecordUnlessRecentInput | undefined
  cutoff: Date | undefined
  now = new Date(2026, 7, 1, 12).getTime()

  protected override async createApiErrorRecordUnlessRecent(
    input: CreateApiErrorRecordUnlessRecentInput,
    cutoff: Date
  ): Promise<void> {
    this.input = input
    this.cutoff = cutoff
  }

  protected override getCurrentTime(): number {
    return this.now
  }
}

function getRecordedInput(
  service: TestApiErrorRecorderService
): CreateApiErrorRecordUnlessRecentInput {
  expect(service.input).toBeTruthy()
  return service.input!
}

const context: ApiErrorRecordingContext = {
  method: 'POST',
  path: '/api/orders?email=person@example.com&token=secret',
  statusCode: 500,
  correlationId: 'request-123',
}

test('records only allowlisted context with a path without query parameters', async () => {
  const service = new TestApiErrorRecorderService()

  await service.record(new Error('Unexpected failure'), context)

  expect(getRecordedInput(service)).toEqual({
    method: 'POST',
    path: '/api/orders',
    statusCode: 500,
    errorName: 'Error',
    message: 'Unexpected failure',
    stack: getRecordedInput(service).stack,
    correlationId: 'request-123',
    fingerprint: getRecordedInput(service).fingerprint,
  })
})

test('scrubs supported credential patterns from messages and stacks', async () => {
  const service = new TestApiErrorRecorderService()
  const error = new Error(
    'authorization: Bearer super-secret token=token-value password=hunter2 api_key=key-value'
  )
  error.stack = 'Error: Bearer another-secret\nCookie=session-value'

  await service.record(error, context)

  const input = getRecordedInput(service)
  expect(
    input.message,
    'authorization=[REDACTED] token=[REDACTED] password=[REDACTED] api_key=[REDACTED]'
  ).toBe('authorization=[REDACTED] token=[REDACTED] password=[REDACTED] api_key=[REDACTED]')
  expect(input.stack).toBe('Error: Bearer [REDACTED]\nCookie=[REDACTED]')
})

test('truncates all bounded diagnostic fields', async () => {
  const service = new TestApiErrorRecorderService()
  const error = new Error('m'.repeat(API_ERROR_RECORD_FIELD_LIMITS.message + 1))
  error.name = 'n'.repeat(API_ERROR_RECORD_FIELD_LIMITS.errorName + 1)
  error.stack = 's'.repeat(API_ERROR_RECORD_FIELD_LIMITS.stack + 1)

  await service.record(error, {
    method: 'M'.repeat(API_ERROR_RECORD_FIELD_LIMITS.method + 1),
    path: `/${'p'.repeat(API_ERROR_RECORD_FIELD_LIMITS.path + 1)}?token=secret`,
    statusCode: 500,
    correlationId: 'c'.repeat(API_ERROR_RECORD_FIELD_LIMITS.correlationId + 1),
  })

  const input = getRecordedInput(service)
  expect(input.method.length).toBe(API_ERROR_RECORD_FIELD_LIMITS.method)
  expect(input.path.length).toBe(API_ERROR_RECORD_FIELD_LIMITS.path)
  expect(input.errorName.length).toBe(API_ERROR_RECORD_FIELD_LIMITS.errorName)
  expect(input.message.length).toBe(API_ERROR_RECORD_FIELD_LIMITS.message)
  expect(input.stack?.length).toBe(API_ERROR_RECORD_FIELD_LIMITS.stack)
  expect(input.correlationId?.length).toBe(API_ERROR_RECORD_FIELD_LIMITS.correlationId)
})

test('uses the same fingerprint for equivalent sanitized failures during a five-minute window', async () => {
  const service = new TestApiErrorRecorderService()
  const error = new Error('token=secret')
  error.stack = 'Error: token=secret'
  await service.record(error, context)
  const firstFingerprint = getRecordedInput(service).fingerprint
  const equivalentError = new Error('token=another-secret')
  equivalentError.stack = 'Error: token=another-secret'

  await service.record(equivalentError, {
    ...context,
    correlationId: 'request-456',
  })

  expect(getRecordedInput(service).fingerprint).toBe(firstFingerprint)
  expect(service.cutoff).toBeTruthy()
  expect(service.cutoff!.getTime()).toBe(service.now - 5 * 60 * 1000)
})

test('includes the sanitized stack in the fingerprint', async () => {
  const service = new TestApiErrorRecorderService()
  const firstError = new Error('Unexpected failure')
  firstError.stack = 'Error: first stack'
  const secondError = new Error('Unexpected failure')
  secondError.stack = 'Error: second stack'

  await service.record(firstError, context)
  const firstFingerprint = getRecordedInput(service).fingerprint
  await service.record(secondError, context)

  expect(getRecordedInput(service).fingerprint).not.toBe(firstFingerprint)
})
