import { createFileRoute } from '@tanstack/react-router'
import { AuthCard } from '~/modules/auth/components/auth-card'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  usePageTitle('auth', 'login.metaTitle')

  return (
    <RequireGuest>
      <AuthShell>
        <AuthCard />
      </AuthShell>
    </RequireGuest>
  )
}
