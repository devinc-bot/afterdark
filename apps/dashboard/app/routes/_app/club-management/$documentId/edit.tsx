import { createFileRoute } from '@tanstack/react-router'
import {
  ClubEditNotFoundView,
  ClubEditView,
} from '~/modules/club-management/components/club-edit-view'
import { clubsQueryOptions } from '~/modules/club-management/queries/use-club-management-queries'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/_app/club-management/$documentId/edit')({
  loader: async ({ context: { queryClient }, params }) => {
    const clubs = await queryClient.ensureQueryData(clubsQueryOptions())
    const club = clubs.find((item) => item.documentId === params.documentId)

    return { club: club ?? null }
  },
  component: ClubEditPage,
})

function ClubEditPage() {
  const { club } = Route.useLoaderData()
  usePageTitle('clubs', 'formPage.editMetaTitle')

  if (!club) {
    return <ClubEditNotFoundView />
  }

  return <ClubEditView club={club} />
}
