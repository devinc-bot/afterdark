import type { EventResponse, PaginatedResponse } from '@afterdark/types'
import type {
  CreateEventInput,
  ListEventsQueryInput,
  UpdateEventInput,
} from '@afterdark/validators'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

export async function fetchEvents(
  params: ListEventsQueryInput
): Promise<PaginatedResponse<EventResponse>> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  try {
    return await api.get<PaginatedResponse<EventResponse>>(
      `${buildApiPath(API_ROUTES.events, API_ROUTES.events.path.list())}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:list.error'))
  }
}

export async function createEvent(input: CreateEventInput): Promise<EventResponse> {
  try {
    return await api.post<EventResponse>(
      buildApiPath(API_ROUTES.events, API_ROUTES.events.path.create()),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:form.errorCreateFallback'))
  }
}

export async function updateEvent(
  documentId: string,
  input: UpdateEventInput
): Promise<EventResponse> {
  try {
    return await api.patch<EventResponse>(
      buildApiPath(API_ROUTES.events, API_ROUTES.events.path.update(documentId)),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:form.errorEditFallback'))
  }
}

export async function deleteEvent(documentId: string): Promise<void> {
  try {
    await api.delete(buildApiPath(API_ROUTES.events, API_ROUTES.events.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:delete.errorFallback'))
  }
}
