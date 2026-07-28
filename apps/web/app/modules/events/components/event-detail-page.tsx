import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadErrorBanner, NotFoundView, Skeleton, usePageTitle } from '@repo/ui'
import { PageAtmosphereWash } from '~/modules/common/components/page-atmosphere-wash'
import { Container } from '~/modules/common/components/container'
import { WEB_ROUTES } from '~/modules/common/constants/routes'
import {
  isPublicEventDocumentId,
  usePublicEventDetailQuery,
} from '../queries/use-public-event-detail-query'
import { EventDetailContent } from './event-detail/event-detail-content'

type EventDetailPageProps = {
  documentId: string
}

export function EventDetailPage({ documentId }: EventDetailPageProps) {
  const { t } = useTranslation('events')
  const { t: tCommon } = useTranslation('common')
  const isValidDocumentId = isPublicEventDocumentId(documentId)
  const {
    data: event,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = usePublicEventDetailQuery(documentId)

  usePageTitle('events', 'discover.detail.metaTitleFallback')

  useEffect(() => {
    if (!event?.name) {
      return
    }

    document.title = t('discover.detail.metaTitle', { name: event.name })
  }, [event?.name, t])

  const showNotFound = !isValidDocumentId || (!isPending && !isError && event === null)
  const showLoading = isValidDocumentId && isPending
  const showError = isValidDocumentId && isError
  const showContent = isValidDocumentId && !isPending && !isError && event

  return (
    <div className="relative min-h-svh overflow-x-clip bg-background text-on-background">
      <Container className="relative z-10 py-8 sm:py-10 lg:py-12">
        <PageAtmosphereWash />
        {showLoading ? <EventDetailLoadingState /> : null}

        {showError ? (
          <LoadErrorBanner
            className="my-0 w-full max-w-none"
            title={t('discover.detail.errorTitle')}
            message={error instanceof Error ? error.message : t('discover.detail.error')}
            retryLabel={t('discover.detail.retry')}
            onRetry={() => {
              void refetch()
            }}
            isRetrying={isFetching}
          />
        ) : null}

        {showNotFound ? (
          <NotFoundView
            brandLabel={tCommon('appNameUpper')}
            title={t('discover.detail.notFoundTitle')}
            description={t('discover.detail.notFoundDescription')}
            actionLabel={t('discover.detail.backToEvents')}
            actionTo={WEB_ROUTES.events()}
            className="min-h-0 py-16"
          />
        ) : null}

        {showContent ? <EventDetailContent event={event} /> : null}
      </Container>
    </div>
  )
}

function EventDetailLoadingState() {
  const { t } = useTranslation('events')

  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-8">
      <p className="sr-only">{t('discover.detail.loading')}</p>
      <Skeleton className="h-4 w-32 bg-primary/10" />
      <Skeleton className="aspect-video w-full rounded-none bg-primary/10 sm:aspect-19/9 sm:rounded-app-lg" />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-3 lg:col-span-8">
          <Skeleton className="h-9 w-3/4 bg-primary/12" />
          <Skeleton className="h-4 w-1/2 bg-primary/10" />
          <Skeleton className="mt-4 h-4 w-full bg-primary/8" />
          <Skeleton className="h-4 w-5/6 bg-primary/8" />
          <Skeleton className="h-4 w-2/3 bg-primary/8" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-28 w-full rounded-app-lg bg-primary/10" />
        </div>
      </div>
    </div>
  )
}
