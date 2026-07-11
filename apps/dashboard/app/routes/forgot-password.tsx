import { createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { ForgotPasswordUnavailable } from '~/modules/auth/components/forgot-password-unavailable'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@afterdark/ui'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  usePageTitle('auth', 'forgotPassword.metaTitle')

  return (
    <RequireGuest>
      <AuthShell>
        <ForgotPasswordUnavailable />
      </AuthShell>
    </RequireGuest>
  )
}
