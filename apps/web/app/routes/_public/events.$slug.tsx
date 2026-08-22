import { createFileRoute } from '@tanstack/react-router'
import { EventDetailPage } from '~/modules/events/components/event-detail-page'

export const Route = createFileRoute('/_public/events/$slug')({
  component: EventDetailRoute,
})

function EventDetailRoute() {
  const { slug } = Route.useParams()
  return <EventDetailPage slug={slug} />
}
