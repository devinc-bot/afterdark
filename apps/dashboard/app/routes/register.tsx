import { createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { RegisterForm } from '~/modules/auth/components/register-form'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@repo/ui'

type RegisterSearch = {
  error?: string
}

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
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
