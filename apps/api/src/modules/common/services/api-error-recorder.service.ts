import { Injectable } from '@nestjs/common'
import { createHash } from 'node:crypto'
import {
  API_ERROR_RECORD_FIELD_LIMITS,
  createApiErrorRecordUnlessRecent,
  type CreateApiErrorRecordUnlessRecentInput,
} from '@repo/db'

export type ApiErrorRecordingContext = {
  method: string
  path: string
  statusCode: number
  correlationId?: string
}

const CREDENTIAL_PATTERNS = [
  /\b(bearer)\s+[a-z0-9._~+/=-]+/gi,
  /\b(password|token|api[_-]?key|authorization|cookie)\b\s*[:=]\s*(?:bearer\s+)?[^\s,;&]+/gi,
]
const REDACTED_CREDENTIAL = '[REDACTED]'
const API_ERROR_DUPLICATE_WINDOW_MS = 5 * 60 * 1000

@Injectable()
export class ApiErrorRecorderService {
  async record(error: unknown, context: ApiErrorRecordingContext): Promise<void> {
    const exception = error instanceof Error ? error : new Error(String(error))

    const input = {
      method: this.normalize(context.method, API_ERROR_RECORD_FIELD_LIMITS.method),
      path: this.normalizePath(context.path),
      statusCode: context.statusCode,
      errorName: this.normalize(exception.name, API_ERROR_RECORD_FIELD_LIMITS.errorName),
      message: this.sanitizeText(exception.message, API_ERROR_RECORD_FIELD_LIMITS.message),
      stack: exception.stack
        ? this.sanitizeText(exception.stack, API_ERROR_RECORD_FIELD_LIMITS.stack)
        : null,
      correlationId: context.correlationId
        ? this.normalize(context.correlationId, API_ERROR_RECORD_FIELD_LIMITS.correlationId)
        : null,
    }

    await this.createApiErrorRecordUnlessRecent(
      {
        ...input,
        fingerprint: this.createFingerprint(input),
      },
      new Date(this.getCurrentTime() - API_ERROR_DUPLICATE_WINDOW_MS)
    )
  }

  protected createApiErrorRecordUnlessRecent(
    input: CreateApiErrorRecordUnlessRecentInput,
    cutoff: Date
  ): Promise<unknown> {
    return createApiErrorRecordUnlessRecent(input, cutoff)
  }

  protected getCurrentTime(): number {
    return Date.now()
  }

  private normalizePath(path: string): string {
    return this.normalize(path.split('?')[0] ?? '', API_ERROR_RECORD_FIELD_LIMITS.path)
  }

  private sanitizeText(value: string, limit: number): string {
    let sanitized = value.replace(/\r\n?/g, '\n').trim()

    for (const pattern of CREDENTIAL_PATTERNS) {
      sanitized = sanitized.replace(pattern, (_, credentialType: string) =>
        credentialType.toLowerCase() === 'bearer'
          ? `Bearer ${REDACTED_CREDENTIAL}`
          : `${credentialType}=${REDACTED_CREDENTIAL}`
      )
    }

    return this.normalize(sanitized, limit)
  }

  private normalize(value: string, limit: number): string {
    return value.trim().slice(0, limit)
  }

  private createFingerprint(
    input: Omit<CreateApiErrorRecordUnlessRecentInput, 'fingerprint'>
  ): string {
    return createHash('sha256')
      .update(
        JSON.stringify([
          input.method,
          input.path,
          input.statusCode,
          input.errorName,
          input.message,
          input.stack,
        ])
      )
      .digest('hex')
  }
}
