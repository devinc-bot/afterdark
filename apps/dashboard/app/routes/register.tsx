import { createFileRoute } from '@tanstack/react-router'
import { AuthCard } from '~/modules/auth/components/auth-card'
import { AuthShell } from '~/modules/auth/components/auth-shell'

export const Route = createFileRoute('/register')({
  head: () => ({ meta: [{ title: 'Crear cuenta · afterdark Admin' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <AuthShell>
      <AuthCard />
    </AuthShell>
  )
}
