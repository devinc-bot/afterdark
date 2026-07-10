import { createFileRoute } from '@tanstack/react-router'
import { AuthPageLayout } from '~/modules/auth/components/auth-page-layout'
import { LoginForm } from '~/modules/auth/components/login-form'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  usePageTitle('auth', 'login.metaTitleWeb')

  return (
    <RequireGuest>
      <AuthPageLayout>
        <LoginForm />
      </AuthPageLayout>
    </RequireGuest>
  )
}
