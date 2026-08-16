import { db } from '../../client.ts'
import {
  apiErrorRecords,
  type ApiErrorRecordInsert,
  type ApiErrorRecordSelect,
} from '../../schema/api-error-record.ts'

export type CreateApiErrorRecordInput = Pick<
  ApiErrorRecordInsert,
  'method' | 'path' | 'statusCode' | 'errorName' | 'message' | 'stack' | 'correlationId'
>

export async function createApiErrorRecord(
  input: CreateApiErrorRecordInput
): Promise<ApiErrorRecordSelect> {
  const [record] = await db.insert(apiErrorRecords).values(input).returning()

  if (!record) {
    throw new Error('API error record insert returned no row')
  }

  return record
}
