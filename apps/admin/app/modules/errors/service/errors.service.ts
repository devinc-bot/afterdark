import type { ApiErrorRecordResponse, PaginatedResponse } from '@repo/types'
import type { ListApiErrorRecordsQueryInput } from '@repo/validators'
import { i18n } from '@repo/i18n/client'
import { buildApiPath, toApiServiceError } from '@repo/common'
import { api, API_ROUTES } from '~/config/api'

function toErrorRecordsSearchParams(params: ListApiErrorRecordsQueryInput): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  if (params.statusCode !== undefined) searchParams.set('statusCode', String(params.statusCode))
  if (params.path) searchParams.set('path', params.path)
  if (params.from) searchParams.set('from', params.from.toISOString())
  if (params.to) searchParams.set('to', params.to.toISOString())

  return searchParams.toString()
}

export async function fetchApiErrorRecords(
  params: ListApiErrorRecordsQueryInput
): Promise<PaginatedResponse<ApiErrorRecordResponse>> {
  const query = toErrorRecordsSearchParams(params)
  const path = buildApiPath(API_ROUTES.errors, API_ROUTES.errors.path.list())

  try {
    return await api.get<PaginatedResponse<ApiErrorRecordResponse>>(`${path}?${query}`)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:errors.list.error'))
  }
}

export async function deleteApiErrorRecord(documentId: string): Promise<void> {
  const path = buildApiPath(API_ROUTES.errors, API_ROUTES.errors.path.delete(documentId))

  try {
    await api.delete<void>(path)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('admin:errors.delete.error'))
  }
}
