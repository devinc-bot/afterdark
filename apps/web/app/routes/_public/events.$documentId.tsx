import { createFileRoute } from '@tanstack/react-router'
import { EventDetailPage } from '~/modules/events/components/event-detail-page'

export const Route = createFileRoute('/_public/events/$documentId')({
  component: EventDetailRoute,
})

function EventDetailRoute() {
  const { documentId } = Route.useParams()

  return <EventDetailPage documentId={documentId} />
}
