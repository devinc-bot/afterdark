import { Link, createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '~/modules/auth/components/auth-shell'
import { RequireGuest } from '~/modules/common/components/require-guest'
import { usePageTitle } from '~/modules/common/hooks/use-page-title'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  usePageTitle('auth', 'forgotPassword.metaTitle')

  return (
    <RequireGuest>
      <AuthShell>
        <div className="rounded-xl border border-outline-variant bg-surface-container p-6 text-center shadow-glass md:p-8">
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Recuperar contraseña
          </h2>
          <p className="mt-3 text-sm text-on-surface-variant">
            Esta función todavía no está disponible. Contactá al administrador de tu venue.
          </p>
          <Link
            to={DASHBOARD_ROUTES.login()}
            className="mt-6 inline-block text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthShell>
    </RequireGuest>
  )
}
