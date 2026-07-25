import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Skeleton } from '@repo/ui'
import type { PublicEventResponse } from '@repo/types'
import { EventsDiscoverListItem } from './events-discover-list-item'

type EventsDiscoverListProps = {
  events: PublicEventResponse[]
  selectedEventId: string | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onFetchNextPage: () => void
  onRetry: () => void
  onSelectEvent: (event: PublicEventResponse) => void
}

export function EventsDiscoverList({
  events,
  selectedEventId,
  isLoading,
  isSuccess,
  isError,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onFetchNextPage,
  onRetry,
  onSelectEvent,
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
      <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
        <p className="sr-only">{t('discover.list.loading')}</p>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-lg border border-primary/15 bg-surface-container-low/40 p-4 sm:gap-5 sm:p-5"
          >
            <Skeleton className="size-20 shrink-0 rounded-md bg-primary/10 sm:size-24" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <Skeleton className="h-6 w-3/4 bg-primary/12" />
              <Skeleton className="h-4 w-2/5 bg-primary/10" />
              <Skeleton className="h-3.5 w-1/2 bg-primary/8" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (showError) {
    return (
      <div
        className="rounded-lg border border-error/40 bg-error-container/15 px-4 py-5"
        role="alert"
      >
        <p className="font-display text-base font-semibold text-error">
          {t('discover.list.errorTitle')}
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">{t('discover.list.error')}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 min-h-10 rounded-lg"
          onClick={onRetry}
        >
          {t('discover.list.retry')}
        </Button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div
        className="rounded-lg border border-primary/25 bg-primary/8 px-5 py-12 sm:px-6"
        role="status"
      >
        <p className="font-display text-2xl font-bold tracking-[-0.03em] text-balance text-primary-fixed sm:text-3xl">
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
      <ul className="flex list-none flex-col gap-3 p-0" aria-label={t('discover.list.resultsAria')}>
        {events.map((event) => (
          <li
            key={event.documentId}
            className="min-w-0 [content-visibility:auto] [contain-intrinsic-size:0_8rem]"
          >
            <EventsDiscoverListItem
              event={event}
              selected={event.documentId === selectedEventId}
              onSelect={() => onSelectEvent(event)}
            />
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
