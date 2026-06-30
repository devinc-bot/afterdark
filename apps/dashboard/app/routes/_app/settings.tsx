import { createFileRoute } from '@tanstack/react-router'
import settingsEs from '@afterdark/i18n/locales/settings/es.json'
import { SettingsView } from '~/modules/owner/components/settings-view'

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: settingsEs.page.metaTitle }] }),
  component: SettingsPage,
})

function SettingsPage() {
  return <SettingsView />
}
