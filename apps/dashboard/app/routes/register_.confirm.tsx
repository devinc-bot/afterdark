import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { usePageTitle } from '@repo/ui'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { RegisterConfirmView } from '~/modules/auth/components/register-confirm-view'
import { RequireGuest } from '~/modules/common/components/require-guest'

const registerConfirmSearchSchema = z.object({
  token: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/register_/confirm')({
  validateSearch: registerConfirmSearchSchema,
  component: RegisterConfirmPage,
})

function RegisterConfirmPage() {
  usePageTitle('auth', 'register.confirm.metaTitle')
  const { token } = Route.useSearch()

  return (
    <RequireGuest>
      <AuthShell>
        <RegisterConfirmView token={token ?? ''} />
      </AuthShell>
    </RequireGuest>
  )
}
