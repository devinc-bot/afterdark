import { Link, createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { DASHBOARD_ROUTES } from '~/modules/shared/constants/routes'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({ meta: [{ title: 'Recuperar contraseña · afterdark Admin' }] }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="glass-card neon-border-primary rounded-xl p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-primary">Recuperar contraseña</h2>
        <p className="mt-4 font-sans text-sm text-on-surface-variant">
          Esta función todavía no está disponible. Contactá al administrador de tu venue.
        </p>
        <Link
          to={DASHBOARD_ROUTES.login()}
          className="mt-8 inline-block font-label text-xs font-semibold uppercase tracking-label-xs text-secondary-fixed transition-colors hover:underline"
        >
          Volver a entrar
        </Link>
      </div>
    </AuthShell>
  )
}
