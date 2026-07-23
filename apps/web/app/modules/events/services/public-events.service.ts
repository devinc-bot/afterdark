import { buildApiPath, toApiServiceError } from '@afterdark/common'
import type { PublicEventsPaginatedResponse } from '@afterdark/types'
import { i18n } from '@afterdark/i18n/client'
import { api, API_ROUTES } from '~/config/api'

export const PUBLIC_EVENTS_PAGE_SIZE = 5

export type FetchPublicEventsParams = {
  page?: number
  limit?: number
  startsFrom?: Date | string
  startsTo?: Date | string
  city?: string
  state?: string
}

function toIsoDateParam(value: Date | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }

  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

function buildPublicEventsSearchParams(params: FetchPublicEventsParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? PUBLIC_EVENTS_PAGE_SIZE),
  })

  const startsFrom = toIsoDateParam(params.startsFrom)
  const startsTo = toIsoDateParam(params.startsTo)
  if (startsFrom) {
    searchParams.set('startsFrom', startsFrom)
  }
  if (startsTo) {
    searchParams.set('startsTo', startsTo)
  }

  const city = params.city?.trim()
  if (city) {
    searchParams.set('city', city)
  }

  const state = params.state?.trim()
  if (state) {
    searchParams.set('state', state)
  }

  return searchParams
}

export async function fetchPublicEvents(
  params: FetchPublicEventsParams = {}
): Promise<PublicEventsPaginatedResponse> {
  const searchParams = buildPublicEventsSearchParams(params)
  const path = buildApiPath(API_ROUTES.events, API_ROUTES.events.path.listPublic())

  try {
    return await api.get<PublicEventsPaginatedResponse>(`${path}?${searchParams.toString()}`)
  } catch (error) {
    throw toApiServiceError(error, i18n.t('events:discover.list.error'))
  }
}
