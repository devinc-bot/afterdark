import { createFileRoute } from '@tanstack/react-router'
import { SettingsView } from '~/modules/settings/components/settings-view'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  usePageTitle('settings', 'page.metaTitle')

  return <SettingsView />
}
