import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PublicEventResponse } from '@repo/types'
import { cn } from '@repo/ui'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { PageHeader } from '~/modules/common/components/page-header'
import { LANDING_SHELL } from '~/modules/landing/constants/layout'
import { usePublicEventsInfiniteQuery } from '../queries/use-public-events-infinite-query'
import {
  appliedFiltersKey,
  areDiscoverFiltersEqual,
  clearDiscoverFilterField,
  EMPTY_EVENTS_DISCOVER_FILTERS,
  type EventsDiscoverFilterField,
  type EventsDiscoverFiltersValue,
} from '../utils/events-discover-filters'
import { EventsDiscoverFiltersPanel } from './events-discover-filters-panel'
import { EventsDiscoverList } from './events-discover-list'
import { EventsDiscoverMap, type EventsDiscoverMapFocus } from './events-discover-map'
import { EventsDiscoverSelection } from './events-discover-selection'
import { EventsDiscoverStatusBar } from './events-discover-status-bar'

function isInvalidDateRange(filters: EventsDiscoverFiltersValue): boolean {
  if (!filters.startsFrom || !filters.startsTo) {
    return false
  }

  return filters.startsTo < filters.startsFrom
}

function shouldScrollListSelectionToMap(): boolean {
  if (typeof window === 'undefined') {
    return true
  }
  return window.matchMedia('(min-width: 1024px)').matches
}

export function EventsDiscoverPage() {
  const { t } = useTranslation('events')
  const [draftFilters, setDraftFilters] = useState(EMPTY_EVENTS_DISCOVER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_EVENTS_DISCOVER_FILTERS)
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [mapFocus, setMapFocus] = useState<EventsDiscoverMapFocus | null>(null)

  const filtersKey = appliedFiltersKey(appliedFilters)
  const isDirty = !areDiscoverFiltersEqual(draftFilters, appliedFilters)
  const {
    data,
    isLoading,
    isSuccess,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = usePublicEventsInfiniteQuery(appliedFilters)

  const events = data?.pages.flatMap((page) => page.data) ?? []
  const resultTotal = data?.pages[0]?.total ?? null
  const selectedEvent = events.find((event) => event.documentId === selectedEventId) ?? null

  const clearMapSelection = () => {
    setSelectedEventId(null)
    setMapFocus(null)
  }

  const handleDraftChange = (next: EventsDiscoverFiltersValue) => {
    setDraftFilters(next)
    if (dateRangeError) {
      setDateRangeError(null)
    }
  }

  const handleApply = (): boolean => {
    if (isInvalidDateRange(draftFilters)) {
      setDateRangeError(t('field.event.endDateAfterStart', { ns: 'validation' }))
      return false
    }

    setDateRangeError(null)
    clearMapSelection()
    setAppliedFilters(draftFilters)
    return true
  }

  const handleClear = () => {
    setDraftFilters(EMPTY_EVENTS_DISCOVER_FILTERS)
    setAppliedFilters(EMPTY_EVENTS_DISCOVER_FILTERS)
    setDateRangeError(null)
    clearMapSelection()
  }

  const handleRemoveFilter = (field: EventsDiscoverFilterField) => {
    const next = clearDiscoverFilterField(appliedFilters, field)
    setDraftFilters(next)
    setAppliedFilters(next)
    setDateRangeError(null)
    clearMapSelection()
  }

  const scrollListItemIntoView = (documentId: string) => {
    document.getElementById(`events-discover-item-${documentId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }

  const handleSelectEvent = (
    event: PublicEventResponse,
    options?: { scrollToMap?: boolean; scrollListIntoView?: boolean }
  ) => {
    setSelectedEventId(event.documentId)

    if (options?.scrollListIntoView) {
      scrollListItemIntoView(event.documentId)
    }

    if (event.latitude === null || event.longitude === null) {
      setMapFocus(null)
      return
    }

    setMapFocus((prev) => ({
      eventId: event.documentId,
      latitude: event.latitude!,
      longitude: event.longitude!,
      token: (prev?.token ?? 0) + 1,
    }))

    const scrollToMap = options?.scrollToMap ?? shouldScrollListSelectionToMap()
    if (!scrollToMap) {
      return
    }

    document.getElementById('events-discover-map')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }

  const handleSelectEventById = (documentId: string) => {
    const event = events.find((item) => item.documentId === documentId)
    if (!event) {
      return
    }
    handleSelectEvent(event, { scrollToMap: false, scrollListIntoView: true })
  }

  return (
    <div className={LANDING_SHELL}>
      <div className="relative">
        <PageAtmosphereWash />
        <PageHeader title={t('discover.page.title')} description={t('discover.page.description')} />

        <div className="flex flex-col gap-6 lg:gap-8">
          <section aria-label={t('discover.map.ariaLabel')} className="w-full">
            <div className="overflow-hidden rounded-control border border-hairline/50 bg-surface-container-lowest/40">
              <EventsDiscoverMap
                key={filtersKey}
                events={events}
                focus={mapFocus}
                selectedEventId={selectedEventId}
                onSelectEventId={handleSelectEventById}
              />
            </div>
            <p className="sr-only" aria-live="polite">
              {selectedEvent
                ? t('discover.selection.announced', { name: selectedEvent.name })
                : null}
            </p>
          </section>

          <section
            aria-label={t('discover.filters.title')}
            className={cn(
              'rounded-control border bg-surface-card p-4 sm:p-5',
              'transition-colors duration-(--duration-fast) ease-emphasized',
              'motion-reduce:transition-none',
              isDirty ? 'border-primary/35' : 'border-hairline/60'
            )}
          >
            <EventsDiscoverFiltersPanel
              value={draftFilters}
              onChange={handleDraftChange}
              onClear={handleClear}
              onApply={() => {
                handleApply()
              }}
              dateRangeError={dateRangeError}
              isDirty={isDirty}
              idPrefix="events-filter"
              layout="bar"
              showHeading={false}
              showPendingHint
            />
          </section>

          <EventsDiscoverStatusBar
            appliedFilters={appliedFilters}
            total={resultTotal}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClear}
          />

          <section className="min-h-48 min-w-0" aria-label={t('discover.page.title')}>
            {selectedEvent ? (
              <div className="mb-6 sm:mb-7">
                <EventsDiscoverSelection event={selectedEvent} onClear={clearMapSelection} />
              </div>
            ) : null}

            <EventsDiscoverList
              key={filtersKey}
              events={events}
              selectedEventId={selectedEventId}
              isLoading={isLoading}
              isSuccess={isSuccess}
              isError={isError}
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              isFetchNextPageError={isFetchNextPageError}
              onFetchNextPage={() => void fetchNextPage()}
              onRetry={() => void refetch()}
              onSelectEvent={handleSelectEvent}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
