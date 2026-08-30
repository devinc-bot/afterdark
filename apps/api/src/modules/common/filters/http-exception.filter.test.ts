import { expect, test, vi } from 'vitest'
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

  expect(filter).toBeTruthy()
  expect(recorder).toBeTruthy()
})

test('records an unknown error as a generic internal failure', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost()

  await filter.catch(new Error('Database unavailable'), host)

  expect(filter.recorded?.context).toEqual({
    method: 'POST',
    path: '/api/events?token=secret',
    statusCode: 500,
  })
  expect(response.statusCode).toBe(500)
  expect(response.body?.message).toBe('Internal server error')
})

test('records explicit 5xx HTTP exceptions without exposing their details', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost('/api/events')
  const exception = new HttpException('Upstream unavailable', 503)

  await filter.catch(exception, host)

  expect(filter.recorded?.context.statusCode).toBe(503)
  expect(filter.recorded?.error).toBe(exception)
  expect(response.statusCode).toBe(503)
  expect(response.body?.message).toBe('Internal server error')
})

test('does not record 4xx HTTP exceptions', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost('/api/events')

  await filter.catch(new HttpException('Invalid event', 400), host)

  expect(filter.recorded).toBeUndefined()
  expect(response.statusCode).toBe(400)
  expect(response.body?.message).toBe('Invalid event')
})

test('logs a recording failure and preserves the 5xx response', async () => {
  const filter = new TestHttpExceptionFilter()
  const { host, response } = createHost('/api/events')
  const recordingError = new Error('Database unavailable')
  const loggedErrors: unknown[][] = []
  filter.recordingError = recordingError
  vi.spyOn(Logger.prototype, 'error').mockImplementation((...args: unknown[]) => {
    loggedErrors.push(args)
  })

  await filter.catch(new HttpException('Service unavailable', 503), host)

  expect(loggedErrors).toEqual([['API error recording failed', recordingError]])
  expect(response.statusCode).toBe(503)
  expect(response.body?.message).toBe('Internal server error')
})
