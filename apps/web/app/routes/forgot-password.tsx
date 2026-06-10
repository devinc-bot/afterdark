import { Link, createFileRoute } from '@tanstack/react-router'
import { WEB_ROUTES } from '~/modules/shared/constants/routes'

export const Route = createFileRoute('/forgot-password')({
  head: () => ({ meta: [{ title: 'Recuperar contraseña · afterdark' }] }),
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-6 py-5 sm:px-8">
        <Link
          to={WEB_ROUTES.home()}
          className="text-sm font-bold tracking-tight text-foreground transition-colors duration-150 hover:text-accent"
        >
          afterdark
        </Link>
      </header>

      <main className="grid flex-1 place-items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold tracking-tight text-balance">Recuperar contraseña</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            La recuperación automática todavía no está disponible. Escribinos a
            soporte@afterdark.app y te ayudamos a recuperar el acceso.
          </p>
          <Link
            to={WEB_ROUTES.login()}
            className="mt-8 inline-block text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-accent"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </main>

      <footer className="px-6 py-5 text-center">
        <p className="text-xs text-muted-foreground">© afterdark</p>
      </footer>
    </div>
  )
}
