import { OrganizationProfilePage } from './organization-profile-page'

type OrganizationEventsPageProps = {
  slug: string
}

export function OrganizationEventsPage({ slug }: OrganizationEventsPageProps) {
  return <OrganizationProfilePage slug={slug} />
}
