import { createFileRoute } from '@tanstack/react-router'
import { AuthPageLayout } from '~/modules/auth/components/auth-page-layout'
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
  usePageTitle('auth', 'register.metaTitleWeb')

  return (
    <RequireGuest>
      <AuthPageLayout>
        <RegisterForm />
      </AuthPageLayout>
    </RequireGuest>
  )
}
