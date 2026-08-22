import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, cn } from '@repo/ui'
import { ChevronDown } from 'lucide-react'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { Container } from '~/modules/common/components/container'
import { PageHeader } from '~/modules/common/components/page-header'
import { usePublicEventsInfiniteQuery } from '../queries/use-public-events-infinite-query'
import { buildEventsDiscoverCoverflowSlides } from '../utils/events-discover-coverflow'
import {
  appliedFiltersKey,
  areDiscoverFiltersEqual,
  clearDiscoverFilterField,
  countActiveDiscoverFilters,
  filtersFromSearch,
  searchFromFilters,
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
  const { t, i18n } = useTranslation('events')
  const navigate = useNavigate()
  const search = useSearch({ from: '/_public/events/' })
  const urlFilters = filtersFromSearch(search)

  const [draftFilters, setDraftFilters] = useState(urlFilters)
  const [appliedFilters, setAppliedFilters] = useState(urlFilters)
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(() => countActiveDiscoverFilters(urlFilters) > 0)

  const urlKey = appliedFiltersKey(urlFilters)

  useEffect(() => {
    const next = filtersFromSearch(search)
    setDraftFilters(next)
    setAppliedFilters(next)
    setDateRangeError(null)
    if (countActiveDiscoverFilters(next) > 0) {
      setFiltersOpen(true)
    }
  }, [urlKey, search])

  const filtersKey = appliedFiltersKey(appliedFilters)
  const isDirty = !areDiscoverFiltersEqual(draftFilters, appliedFilters)
  const activeFilterCount = countActiveDiscoverFilters(appliedFilters)
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
  const coverflowSlides = buildEventsDiscoverCoverflowSlides(events, i18n.language)

  const persistFilters = (next: EventsDiscoverFiltersValue) => {
    void navigate({
      to: '/events',
      search: () => searchFromFilters(next),
      replace: true,
    })
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
    setAppliedFilters(draftFilters)
    persistFilters(draftFilters)
    return true
  }

  const handleClear = () => {
    setDraftFilters(filtersFromSearch({}))
    setAppliedFilters(filtersFromSearch({}))
    setDateRangeError(null)
    persistFilters(filtersFromSearch({}))
  }

  const handleRemoveFilter = (field: EventsDiscoverFilterField) => {
    const next = clearDiscoverFilterField(appliedFilters, field)
    setDraftFilters(next)
    setAppliedFilters(next)
    setDateRangeError(null)
    persistFilters(next)
  }

  const handleCoverflowActivate = (slug: string) => {
    void navigate({
      to: '/events/$slug',
      params: { slug },
    })
  }

  return (
    <Container>
      <div className="relative">
        <PageAtmosphereWash />
        <PageHeader title={t('discover.page.title')} description={t('discover.page.description')} />

        <div className="flex flex-col gap-10 lg:gap-12">
          {coverflowSlides.length > 0 ? (
            <EventsDiscoverCoverflow
              key={filtersKey}
              slides={coverflowSlides}
              onActivate={handleCoverflowActivate}
            />
          ) : null}

          <section className="flex flex-col gap-4" aria-labelledby="events-catalog-heading">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2
                  id="events-catalog-heading"
                  className="font-display text-lg font-semibold tracking-tight text-balance text-on-surface sm:text-xl"
                >
                  {t('discover.list.heading')}
                </h2>

                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 gap-2"
                    aria-expanded={filtersOpen}
                  >
                    {activeFilterCount > 0
                      ? t('discover.filters.openWithCount', { count: activeFilterCount })
                      : t('discover.filters.open')}
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform duration-(--duration-fast)',
                        filtersOpen && 'rotate-180'
                      )}
                      aria-hidden
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="data-[state=closed]:animate-none">
                <div className="mt-4 rounded-app border border-hairline/30 bg-surface-muted/60 p-4 sm:p-5">
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
                </div>
              </CollapsibleContent>
            </Collapsible>

            <EventsDiscoverStatusBar
              appliedFilters={appliedFilters}
              total={resultTotal}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClear}
            />

            <div className="min-h-48 min-w-0">
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
            </div>
          </section>
        </div>
      </div>
    </Container>
  )
}
