import type { EventResponse, PaginatedResponse } from '@afterdark/types'
import type {
  CreateEventInput,
  ListEventsQueryInput,
  UpdateEventInput,
} from '@afterdark/validators'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'
import { buildApiPath, toApiServiceError } from '@afterdark/common'

function appendEventFields(formData: FormData, input: CreateEventInput | UpdateEventInput): void {
  formData.append('locationId', input.locationId)
  formData.append('name', input.name)
  formData.append('description', input.description)
  formData.append(
    'startsAt',
    input.startsAt instanceof Date ? input.startsAt.toISOString() : String(input.startsAt)
  )
  formData.append(
    'endsAt',
    input.endsAt instanceof Date ? input.endsAt.toISOString() : String(input.endsAt)
  )
  formData.append('status', input.status)
}

function toCreateEventFormData(input: CreateEventInput, images: File[]): FormData {
  const formData = new FormData()
  appendEventFields(formData, input)
  for (const image of images) {
    formData.append('images', image)
  }
  return formData
}

function toUpdateEventFormData(
  input: UpdateEventInput,
  keepImageIds: string[],
  newImages: File[]
): FormData {
  const formData = new FormData()
  appendEventFields(formData, input)
  for (const imageId of keepImageIds) {
    formData.append('keepImageIds', imageId)
  }
  for (const image of newImages) {
    formData.append('images', image)
  }
  return formData
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
      `${buildApiPath(API_ROUTES.events, API_ROUTES.events.path.list())}?${searchParams.toString()}`
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:list.error'))
  }
}

export async function fetchEvent(documentId: string): Promise<EventResponse> {
  try {
    return await api.get<EventResponse>(
      buildApiPath(API_ROUTES.events, API_ROUTES.events.path.get(documentId))
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:form.errorEditFallback'))
  }
}

export async function createEvent(
  input: CreateEventInput,
  images: File[] = []
): Promise<EventResponse> {
  try {
    return await api.post<EventResponse>(
      buildApiPath(API_ROUTES.events, API_ROUTES.events.path.create()),
      toCreateEventFormData(input, images)
    )
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:form.errorCreateFallback'))
  }
}

export async function updateEvent(
  documentId: string,
  input: UpdateEventInput,
  keepImageIds: string[] = [],
  newImages: File[] = []
): Promise<EventResponse> {
  try {
    return await api.patch<EventResponse>(
      buildApiPath(API_ROUTES.events, API_ROUTES.events.path.update(documentId)),
      toUpdateEventFormData(input, keepImageIds, newImages)
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
