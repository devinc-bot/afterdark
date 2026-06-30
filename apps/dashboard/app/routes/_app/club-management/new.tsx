import { createFileRoute } from '@tanstack/react-router'
import clubsEs from '@afterdark/i18n/locales/clubs/es.json'
import { ClubCreatePage } from '~/modules/club-management/components/club-create-page'

export const Route = createFileRoute('/_app/club-management/new')({
  head: () => ({ meta: [{ title: clubsEs.formPage.createMetaTitle }] }),
  component: ClubCreatePage,
})
