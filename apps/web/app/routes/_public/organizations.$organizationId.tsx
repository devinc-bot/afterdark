import { createFileRoute } from '@tanstack/react-router'
import { OrganizationEventsPage } from '~/modules/organizations/components/organization-events-page'

export const Route = createFileRoute('/_public/organizations/$organizationId')({
  component: OrganizationRoute,
})

function OrganizationRoute() {
  const { organizationId } = Route.useParams()

  return <OrganizationEventsPage organizationId={organizationId} />
}
