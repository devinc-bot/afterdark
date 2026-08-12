import { and, eq, gte } from 'drizzle-orm'
import { db } from '../../client.ts'
import { apiErrorRecords, type ApiErrorRecordSelect } from '../../schema/api-error-record.ts'
import type { CreateApiErrorRecordInput } from './create-api-error-record.ts'

export type CreateApiErrorRecordUnlessRecentInput = CreateApiErrorRecordInput & {
  fingerprint: string
}

export async function createApiErrorRecordUnlessRecent(
  input: CreateApiErrorRecordUnlessRecentInput,
  cutoff: Date
): Promise<ApiErrorRecordSelect | null> {
  const [recentRecord] = await db
    .select({ id: apiErrorRecords.id })
    .from(apiErrorRecords)
    .where(
      and(
        eq(apiErrorRecords.fingerprint, input.fingerprint),
        gte(apiErrorRecords.createdAt, cutoff)
      )
    )
    .limit(1)

  if (recentRecord) return null

  const [record] = await db.insert(apiErrorRecords).values(input).returning()

  if (!record) {
    throw new Error('API error record insert returned no row')
  }

  return record
}
