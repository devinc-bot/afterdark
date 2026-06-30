import { createFileRoute } from '@tanstack/react-router'
import { SettingsView } from '~/modules/owner/components/settings-view'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  usePageTitle('settings', 'page.metaTitle')

  return <SettingsView />
}
