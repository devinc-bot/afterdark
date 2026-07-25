import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@repo/ui'
import { AuthPageLayout } from '~/modules/auth/components/auth-page-layout'
import { ForgotPasswordForm } from '~/modules/auth/components/forgot-password-form'
import { RequireGuest } from '~/modules/common/components/require-guest'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  usePageTitle('auth', 'forgotPassword.metaTitleWeb')

  return (
    <RequireGuest>
      <AuthPageLayout>
        <ForgotPasswordForm />
      </AuthPageLayout>
    </RequireGuest>
  )
}
