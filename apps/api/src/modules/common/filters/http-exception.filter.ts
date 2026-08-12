import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import {
  ApiErrorRecorderService,
  type ApiErrorRecordingContext,
} from '../services/api-error-recorder.service.ts'

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  constructor(
    @Inject(ApiErrorRecorderService)
    private readonly apiErrorRecorder: ApiErrorRecorderService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception instanceof HttpException ? exception.getStatus() : 500
    const error = exception instanceof Error ? exception : new Error(String(exception))

    if (status >= 500) {
      try {
        await this.record(error, {
          method: request.method,
          path: request.url,
          statusCode: status,
        })
      } catch (recordingError) {
        this.logger.error('API error recording failed', recordingError)
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        status >= 500 || !(exception instanceof HttpException)
          ? 'Internal server error'
          : exception.message,
    })
  }

  protected record(error: Error, context: ApiErrorRecordingContext): Promise<void> {
    return this.apiErrorRecorder.record(error, context)
  }
}
