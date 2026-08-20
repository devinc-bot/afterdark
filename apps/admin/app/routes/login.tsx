import { createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { LoginForm } from '~/modules/auth/components/login-form'
import { RequireGuest } from '~/modules/common/components/require-guest'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <RequireGuest>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </RequireGuest>
  )
}
