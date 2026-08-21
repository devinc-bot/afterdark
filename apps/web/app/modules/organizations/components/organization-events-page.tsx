import { OrganizationProfilePage } from './organization-profile-page'

type OrganizationEventsPageProps = {
  organizationId: string
}

/** Public route adapter kept while the URL parameter remains organizationId. */
export function OrganizationEventsPage({ organizationId }: OrganizationEventsPageProps) {
  return <OrganizationProfilePage documentId={organizationId} />
}
