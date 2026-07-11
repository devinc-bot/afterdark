import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { usePageTitle } from '@afterdark/ui'
import { AuthPageLayout } from '~/modules/auth/components/auth-page-layout'
import { ResetPasswordForm } from '~/modules/auth/components/reset-password-form'
import { RequireGuest } from '~/modules/common/components/require-guest'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  usePageTitle('auth', 'resetPassword.metaTitleWeb')
  const { token } = Route.useSearch()

  return (
    <RequireGuest>
      <AuthPageLayout>
        <ResetPasswordForm token={token ?? ''} />
      </AuthPageLayout>
    </RequireGuest>
  )
}
