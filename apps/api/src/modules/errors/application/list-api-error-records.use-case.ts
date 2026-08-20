import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { findApiErrorRecordsPaginated } from '@repo/db'
import type { ApiErrorRecordResponse, PaginatedResponse } from '@repo/types'
import type { ListApiErrorRecordsQueryInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class ListApiErrorRecordsUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    query: ListApiErrorRecordsQueryInput
  ): Promise<PaginatedResponse<ApiErrorRecordResponse>> {
    try {
      const { rows, total } = await findApiErrorRecordsPaginated({
        page: query.page,
        limit: query.limit,
        statusCode: query.statusCode,
        path: query.path,
        from: query.from,
        to: query.to,
      })

      const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

      return {
        data: rows.map((row) => ({
          documentId: row.documentId,
          method: row.method,
          path: row.path,
          statusCode: row.statusCode,
          errorName: row.errorName,
          message: row.message,
          stack: row.stack,
          correlationId: row.correlationId,
          fingerprint: row.fingerprint,
          createdAt: row.createdAt.toISOString(),
        })),
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      }
    } catch {
      throw new InternalServerErrorException(this.ts.translateError('admin.ERRORS_LIST_FAILED'))
    }
  }
}
