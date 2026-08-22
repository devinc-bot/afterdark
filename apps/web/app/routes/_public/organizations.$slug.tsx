import { createFileRoute } from '@tanstack/react-router'
import { OrganizationEventsPage } from '~/modules/organizations/components/organization-events-page'

export const Route = createFileRoute('/_public/organizations/$slug')({
  component: OrganizationRoute,
})

function OrganizationRoute() {
  const { slug } = Route.useParams()
  return <OrganizationEventsPage slug={slug} />
}
