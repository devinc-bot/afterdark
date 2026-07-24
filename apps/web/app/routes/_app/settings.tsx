import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@afterdark/ui'
import { SettingsPage } from '~/modules/settings/components/settings-page'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsRoute,
})

function SettingsRoute() {
  usePageTitle('settings', 'web.page.metaTitle')

  return <SettingsPage />
}
