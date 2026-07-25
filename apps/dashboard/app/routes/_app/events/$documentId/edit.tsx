import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  EventEditErrorView,
  EventEditLoadingView,
  EventEditNotFoundView,
  EventEditView,
} from '~/modules/events/components/event-edit-view'
import { useEvent } from '~/modules/events/queries/use-event-queries'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/_app/events/$documentId/edit')({
  component: EventEditPage,
})

function EventEditPage() {
  const { documentId } = Route.useParams()
  const { t } = useTranslation('events')
  const { data: event, isLoading, isError, error, refetch, isFetching } = useEvent(documentId)
  usePageTitle('events', 'form.editMetaTitle')

  if (isLoading) {
    return <EventEditLoadingView />
  }

  if (isError) {
    return (
      <EventEditErrorView
        message={error instanceof Error ? error.message : t('form.loadErrorFallback')}
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  if (!event) {
    return <EventEditNotFoundView />
  }

  return <EventEditView event={event} />
}
