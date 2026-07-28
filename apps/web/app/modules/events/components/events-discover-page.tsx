import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Card } from '@repo/ui'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { Container } from '~/modules/common/components/container'
import { PageHeader } from '~/modules/common/components/page-header'
import { usePublicEventsInfiniteQuery } from '../queries/use-public-events-infinite-query'
import { buildEventsDiscoverCoverflowSlides } from '../utils/events-discover-coverflow'
import {
  appliedFiltersKey,
  areDiscoverFiltersEqual,
  clearDiscoverFilterField,
  EMPTY_EVENTS_DISCOVER_FILTERS,
  type EventsDiscoverFilterField,
  type EventsDiscoverFiltersValue,
} from '../utils/events-discover-filters'
import { EventsDiscoverCoverflow } from './events-discover-coverflow'
import { EventsDiscoverFiltersPanel } from './events-discover-filters-panel'
import { EventsDiscoverList } from './events-discover-list'
import { EventsDiscoverStatusBar } from './events-discover-status-bar'

function isInvalidDateRange(filters: EventsDiscoverFiltersValue): boolean {
  if (!filters.startsFrom || !filters.startsTo) {
    return false
  }

  return filters.startsTo < filters.startsFrom
}

export function EventsDiscoverPage() {
  const { t } = useTranslation('events')
  const navigate = useNavigate()
  const [draftFilters, setDraftFilters] = useState(EMPTY_EVENTS_DISCOVER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_EVENTS_DISCOVER_FILTERS)
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)

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
  const coverflowSlides = buildEventsDiscoverCoverflowSlides(events)

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
    setAppliedFilters(draftFilters)
    return true
  }

  const handleClear = () => {
    setDraftFilters(EMPTY_EVENTS_DISCOVER_FILTERS)
    setAppliedFilters(EMPTY_EVENTS_DISCOVER_FILTERS)
    setDateRangeError(null)
  }

  const handleRemoveFilter = (field: EventsDiscoverFilterField) => {
    const next = clearDiscoverFilterField(appliedFilters, field)
    setDraftFilters(next)
    setAppliedFilters(next)
    setDateRangeError(null)
  }

  const handleCoverflowActivate = (documentId: string) => {
    void navigate({
      to: '/events/$documentId',
      params: { documentId },
    })
  }

  return (
    <Container>
      <div className="relative">
        <PageAtmosphereWash />
        <PageHeader title={t('discover.page.title')} description={t('discover.page.description')} />

        <div className="flex flex-col gap-6 lg:gap-8">
          {coverflowSlides.length > 0 ? (
            <EventsDiscoverCoverflow
              key={filtersKey}
              slides={coverflowSlides}
              onActivate={handleCoverflowActivate}
            />
          ) : null}

          <Card variant="gradient" aria-label={t('discover.filters.title')} className="p-4 sm:p-5">
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
          </Card>

          <EventsDiscoverStatusBar
            appliedFilters={appliedFilters}
            total={resultTotal}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClear}
          />

          <section className="min-h-48 min-w-0" aria-label={t('discover.page.title')}>
            <EventsDiscoverList
              key={filtersKey}
              events={events}
              isLoading={isLoading}
              isSuccess={isSuccess}
              isError={isError}
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              isFetchNextPageError={isFetchNextPageError}
              onFetchNextPage={() => void fetchNextPage()}
              onRetry={() => void refetch()}
            />
          </section>
        </div>
      </div>
    </Container>
  )
}
