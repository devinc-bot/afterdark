import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@afterdark/ui'
import { RequireAuth } from '~/modules/common/components/require-auth'
import { SettingsPage } from '~/modules/settings/components/settings-page'

export const Route = createFileRoute('/_public/settings')({
  component: SettingsRoute,
})

function SettingsRoute() {
  usePageTitle('settings', 'web.page.metaTitle')

  return (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  )
}
