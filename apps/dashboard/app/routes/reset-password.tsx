import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { ResetPasswordForm } from '~/modules/auth/components/reset-password-form'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '@afterdark/ui'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  usePageTitle('auth', 'resetPassword.metaTitle')
  const { token } = Route.useSearch()

  return (
    <RequireGuest>
      <AuthShell>
        <ResetPasswordForm token={token ?? ''} />
      </AuthShell>
    </RequireGuest>
  )
}
