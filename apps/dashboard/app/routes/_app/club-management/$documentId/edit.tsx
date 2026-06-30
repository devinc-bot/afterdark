import { createFileRoute } from '@tanstack/react-router'
import clubsEs from '@afterdark/i18n/locales/clubs/es.json'
import { ClubEditNotFound, ClubEditPage } from '~/modules/club-management/components/club-edit-page'
import { clubsQueryOptions } from '~/modules/club-management/queries/use-club-management-queries'

export const Route = createFileRoute('/_app/club-management/$documentId/edit')({
  head: () => ({ meta: [{ title: clubsEs.formPage.editMetaTitle }] }),
  loader: async ({ context: { queryClient }, params }) => {
    const clubs = await queryClient.ensureQueryData(clubsQueryOptions())
    const club = clubs.find((item) => item.documentId === params.documentId)

    return { club: club ?? null }
  },
  component: ClubEditRoutePage,
})

function ClubEditRoutePage() {
  const { club } = Route.useLoaderData()

  if (!club) {
    return <ClubEditNotFound />
  }

  return <ClubEditPage club={club} />
}
