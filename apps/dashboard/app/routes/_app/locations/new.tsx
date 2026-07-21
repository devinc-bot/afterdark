import { createFileRoute } from '@tanstack/react-router'
import { LocationCreateView } from '~/modules/locations/components/location-create-view'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/locations/new')({
  component: LocationCreatePage,
})

function LocationCreatePage() {
  usePageTitle('locations', 'formPage.createMetaTitle')

  return <LocationCreateView />
}
