import { createFileRoute } from '@tanstack/react-router'
import { AuthCard } from '~/modules/auth/components/auth-card'
import { AuthShell } from '~/modules/auth/components/auth-shell'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Iniciar sesión · afterdark Admin' }] }),
  component: LoginPage,
})

function LoginPage() {
  return (
    <AuthShell>
      <AuthCard />
    </AuthShell>
  )
}
