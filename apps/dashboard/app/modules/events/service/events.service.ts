import type { EventResponse, PaginatedResponse } from '@afterdark/types'
import type {
  CreateEventInput,
  ListEventsQueryInput,
  UpdateEventInput,
} from '@afterdark/validators'
import { api } from '~/config/api'
import { API_ROUTES } from '~/config/constants/api'
import { toApiServiceError } from '~/modules/common/utils/api-service-error.utils'

const EVENTS_LIST_ERROR = 'No pudimos cargar los eventos. Intentá de nuevo en unos minutos.'
const CREATE_EVENT_FALLBACK_ERROR = 'No pudimos crear el evento. Intentá de nuevo en unos minutos.'
const UPDATE_EVENT_FALLBACK_ERROR =
  'No pudimos actualizar el evento. Intentá de nuevo en unos minutos.'
const DELETE_EVENT_FALLBACK_ERROR =
  'No pudimos eliminar el evento. Intentá de nuevo en unos minutos.'

function eventsApiPath(path: string) {
  return `${API_ROUTES.events.prefix}${path}`
}

export async function fetchEvents(
  params: ListEventsQueryInput
): Promise<PaginatedResponse<EventResponse>> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  })

  try {
    return await api.get<PaginatedResponse<EventResponse>>(
      `${eventsApiPath(API_ROUTES.events.path.list())}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, EVENTS_LIST_ERROR)
  }
}

export async function createEvent(input: CreateEventInput): Promise<EventResponse> {
  try {
    return await api.post<EventResponse>(eventsApiPath(API_ROUTES.events.path.create()), input)
  } catch (error) {
    throw toApiServiceError(error, CREATE_EVENT_FALLBACK_ERROR)
  }
}

export async function updateEvent(
  documentId: string,
  input: UpdateEventInput
): Promise<EventResponse> {
  try {
    return await api.patch<EventResponse>(
      eventsApiPath(API_ROUTES.events.path.update(documentId)),
      input
    )
  } catch (error) {
    throw toApiServiceError(error, UPDATE_EVENT_FALLBACK_ERROR)
  }
}

export async function deleteEvent(documentId: string): Promise<void> {
  try {
    await api.delete(eventsApiPath(API_ROUTES.events.path.delete(documentId)))
  } catch (error) {
    throw toApiServiceError(error, DELETE_EVENT_FALLBACK_ERROR)
  }
}
