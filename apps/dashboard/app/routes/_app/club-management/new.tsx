import { createFileRoute } from '@tanstack/react-router'
import { ClubCreateView } from '~/modules/club-management/components/club-create-view'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/club-management/new')({
  component: ClubCreatePage,
})

function ClubCreatePage() {
  usePageTitle('clubs', 'formPage.createMetaTitle')

  return <ClubCreateView />
}
