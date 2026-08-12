import { lt } from 'drizzle-orm'
import { db } from '../../client.ts'
import { apiErrorRecords } from '../../schema/api-error-record.ts'

export async function deleteApiErrorRecordsBefore(cutoff: Date): Promise<number> {
  const deleted = await db
    .delete(apiErrorRecords)
    .where(lt(apiErrorRecords.createdAt, cutoff))
    .returning({ id: apiErrorRecords.id })

  return deleted.length
}
