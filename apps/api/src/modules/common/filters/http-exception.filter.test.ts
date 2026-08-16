import assert from 'node:assert/strict'
import test from 'node:test'
import { HttpException, Logger } from '@nestjs/common'
import type { ArgumentsHost } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import {
  ApiErrorRecorderService,
  type ApiErrorRecordingContext,
} from '../services/api-error-recorder.service.ts'
import { HttpExceptionFilter } from './http-exception.filter.ts'

type ResponseBody = {
  statusCode: number
  timestamp: string
  path: string
  message: string
}

class TestHttpExceptionFilter extends HttpExceptionFilter {
  recorded: { error: Error; context: ApiErrorRecordingContext } | undefined
  recordingError: Error | undefined

  constructor() {
    super(undefined as never)
  }

  protected override async record(error: Error, context: ApiErrorRecordingContext): Promise<void> {
    this.recorded = { error, context }
    if (this.recordingError) throw this.recordingError
  }
}

function createHost(path = '/api/events?token=secret'): {
  host: ArgumentsHost
  response: { statusCode: number | undefined; body: ResponseBody | undefined }
} {
  const response = {
    statusCode: undefined as number | undefined,
    body: undefined as ResponseBody | undefined,
    status(statusCode: number) {
      this.statusCode = statusCode
      return this
    },
    json(body: ResponseBody) {
      this.body = body
    },
  }

  return {
    host: {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', url: path }),
        getResponse: () => response,
      }),
    } as ArgumentsHost,
    response,
  }
}

test('injects the error recorder through Nest', async () => {
  const module = await Test.createTestingModule({
    providers: [ApiErrorRecorderService, HttpExceptionFilter],
  }).compile()

  const filter = module.get(HttpExceptionFilter)
  const recorder = module.get(ApiErrorRecorderService)

  assert.ok(filter)
  assert.ok(recorder)
})

test('records an unknown error as a generic internal failure', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost()

  await filter.catch(new Error('Database unavailable'), host)

  assert.deepEqual(filter.recorded?.context, {
    method: 'POST',
    path: '/api/events?token=secret',
    statusCode: 500,
  })
  assert.equal(response.statusCode, 500)
  assert.equal(response.body?.message, 'Internal server error')
})

test('records explicit 5xx HTTP exceptions without exposing their details', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost('/api/events')
  const exception = new HttpException('Upstream unavailable', 503)

  await filter.catch(exception, host)

  assert.equal(filter.recorded?.context.statusCode, 503)
  assert.equal(filter.recorded?.error, exception)
  assert.equal(response.statusCode, 503)
  assert.equal(response.body?.message, 'Internal server error')
})

test('does not record 4xx HTTP exceptions', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost('/api/events')

  await filter.catch(new HttpException('Invalid event', 400), host)

  assert.equal(filter.recorded, undefined)
  assert.equal(response.statusCode, 400)
  assert.equal(response.body?.message, 'Invalid event')
})

test('logs a recording failure and preserves the 5xx response', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost('/api/events')
  const recordingError = new Error('Database unavailable')
  const loggedErrors: unknown[][] = []
  const originalError = Logger.prototype.error
  filter.recordingError = recordingError
  Logger.prototype.error = function (...args: unknown[]): void {
    loggedErrors.push(args)
  }

  try {
    await filter.catch(new HttpException('Service unavailable', 503), host)
  } finally {
    Logger.prototype.error = originalError
  }

  assert.deepEqual(loggedErrors, [['API error recording failed', recordingError]])
  assert.equal(response.statusCode, 503)
  assert.equal(response.body?.message, 'Internal server error')
})
