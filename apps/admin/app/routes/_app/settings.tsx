import { createFileRoute } from '@tanstack/react-router'
import { AccountSessionsView } from '~/modules/settings/components/account-sessions-view'

export const Route = createFileRoute('/_app/settings')({
  component: AccountSessionsView,
})
