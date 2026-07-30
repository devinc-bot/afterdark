import { createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { LoginForm } from '~/modules/auth/components/login-form'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@repo/ui'

type LoginSearch = {
  error?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  usePageTitle('auth', 'login.metaTitle')

  return (
    <RequireGuest>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </RequireGuest>
  )
}
