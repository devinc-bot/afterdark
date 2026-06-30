import { createFileRoute } from '@tanstack/react-router'
import { AuthCard } from '~/modules/auth/components/auth-card'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  usePageTitle('auth', 'register.metaTitle')

  return (
    <RequireGuest>
      <AuthShell>
        <AuthCard />
      </AuthShell>
    </RequireGuest>
  )
}
