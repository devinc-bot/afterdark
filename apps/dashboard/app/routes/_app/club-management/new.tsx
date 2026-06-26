import { createFileRoute } from '@tanstack/react-router'
import { ClubCreatePage } from '~/modules/club-management/components/club-create-page'
import { CLUB_COPY } from '~/modules/club-management/constants/club.copy'

export const Route = createFileRoute('/_app/club-management/new')({
  head: () => ({ meta: [{ title: CLUB_COPY.formPage.createTitle }] }),
  component: ClubCreatePage,
})
