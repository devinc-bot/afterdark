import { createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { RegisterForm } from '~/modules/auth/components/register-form'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@repo/ui'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  usePageTitle('auth', 'register.metaTitle')

  return (
    <RequireGuest>
      <AuthShell>
        <RegisterForm />
      </AuthShell>
    </RequireGuest>
  )
}
