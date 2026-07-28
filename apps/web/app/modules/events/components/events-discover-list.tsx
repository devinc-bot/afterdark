import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, LoadErrorBanner, Skeleton } from '@repo/ui'
import type { PublicEventResponse } from '@repo/types'
import { EventsDiscoverListItem } from './events-discover-list-item'

const EVENTS_DISCOVER_GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'

type EventsDiscoverListProps = {
  events: PublicEventResponse[]
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onFetchNextPage: () => void
  onRetry: () => void
}

export function EventsDiscoverList({
  events,
  isLoading,
  isSuccess,
  isError,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onFetchNextPage,
  onRetry,
}: EventsDiscoverListProps) {
  const { t } = useTranslation('events')
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const isEmpty = isSuccess && events.length === 0
  const showError = isError && events.length === 0

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return
        }
        if (hasNextPage && !isFetchingNextPage) {
          onFetchNextPage()
        }
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage])

  if (isLoading) {
    return (
      <div className={EVENTS_DISCOVER_GRID} aria-busy="true" aria-live="polite">
        <p className="sr-only">{t('discover.list.loading')}</p>
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-control border border-primary/15 bg-surface-container-low/40"
          >
            <Skeleton className="aspect-video w-full rounded-none bg-primary/10" />
            <div className="flex flex-col gap-2 p-4 sm:p-5">
              <Skeleton className="h-6 w-3/4 bg-primary/12" />
              <Skeleton className="h-4 w-full bg-primary/10" />
              <Skeleton className="h-3.5 w-1/2 bg-primary/8" />
              <Skeleton className="mt-2 h-10 w-full bg-primary/10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (showError) {
    return (
      <LoadErrorBanner
        className="my-0 w-full max-w-none"
        title={t('discover.list.errorTitle')}
        message={t('discover.list.error')}
        retryLabel={t('discover.list.retry')}
        onRetry={onRetry}
      />
    )
  }

  if (isEmpty) {
    return (
      <div
        className="rounded-lg border border-primary/25 bg-primary/8 px-5 py-12 sm:px-6"
        role="status"
      >
        <p className="font-display text-2xl font-bold tracking-[-0.03em] text-balance text-primary sm:text-3xl">
          {t('discover.list.emptyTitle')}
        </p>
        <p className="mt-3 max-w-prose text-base text-pretty text-on-surface-variant">
          {t('discover.list.emptyDescription')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <ul
        className={`${EVENTS_DISCOVER_GRID} list-none p-0`}
        aria-label={t('discover.list.resultsAria')}
      >
        {events.map((event) => (
          <li key={event.documentId} className="min-w-0 [contain-intrinsic-size:0_22rem]">
            <EventsDiscoverListItem event={event} />
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />

      {isFetchingNextPage ? (
        <p
          className="border-t border-hairline/40 py-6 text-center font-label text-sm text-primary/70"
          aria-live="polite"
        >
          {t('discover.list.loadingMore')}
        </p>
      ) : null}

      {isFetchNextPageError ? (
        <div className="border-t border-hairline/40 py-6 text-center" role="alert">
          <p className="text-sm text-error">{t('discover.list.error')}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 min-h-10 rounded-lg"
            onClick={onFetchNextPage}
          >
            {t('discover.list.retry')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
