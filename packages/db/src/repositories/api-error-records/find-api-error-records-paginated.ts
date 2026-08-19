import { and, count, desc, eq, gte, like, lte } from 'drizzle-orm'
import type { ApiErrorRecordSelect } from '../../schema/api-error-record.ts'
import { apiErrorRecords } from '../../schema/api-error-record.ts'
import { db } from '../../client.ts'

export type FindApiErrorRecordsPaginatedParams = {
  page: number
  limit: number
  statusCode?: number
  path?: string
  from?: Date
  to?: Date
}

export type PaginatedApiErrorRecordsResult = {
  rows: ApiErrorRecordSelect[]
  total: number
}

export async function findApiErrorRecordsPaginated(
  params: FindApiErrorRecordsPaginatedParams
): Promise<PaginatedApiErrorRecordsResult> {
  const { page, limit } = params
  const offset = (page - 1) * limit

  const conditions = []
  if (params.statusCode !== undefined) {
    conditions.push(eq(apiErrorRecords.statusCode, params.statusCode))
  }
  if (params.path) {
    conditions.push(like(apiErrorRecords.path, `%${params.path}%`))
  }
  if (params.from) {
    conditions.push(gte(apiErrorRecords.createdAt, params.from))
  }
  if (params.to) {
    conditions.push(lte(apiErrorRecords.createdAt, params.to))
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(apiErrorRecords)
      .where(where)
      .orderBy(desc(apiErrorRecords.createdAt), desc(apiErrorRecords.id))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(apiErrorRecords).where(where),
  ])

  return {
    rows,
    total: totalRows[0]?.total ?? 0,
  }
}
