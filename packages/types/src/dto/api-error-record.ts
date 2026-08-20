export type ApiErrorRecordResponse = {
  documentId: string
  method: string
  path: string
  statusCode: number
  errorName: string
  message: string
  stack: string | null
  correlationId: string | null
  fingerprint: string
  createdAt: string
}
