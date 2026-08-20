import { eq } from 'drizzle-orm'
import { db } from '../../client.ts'
import { apiErrorRecords } from '../../schema/api-error-record.ts'

export async function deleteApiErrorRecordByDocumentId(documentId: string): Promise<boolean> {
  const deleted = await db
    .delete(apiErrorRecords)
    .where(eq(apiErrorRecords.documentId, documentId))
    .returning({ id: apiErrorRecords.id })

  return deleted.length === 1
}
