import { createFileRoute } from '@tanstack/react-router'
import { SETTINGS_COPY } from '~/modules/owner/constants/settings.copy'
import { SettingsView } from '~/modules/owner/components/settings-view'

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: `${SETTINGS_COPY.page.title} · afterdark Admin` }] }),
  component: SettingsPage,
})

function SettingsPage() {
  return <SettingsView />
}
