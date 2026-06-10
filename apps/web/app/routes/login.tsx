import { Link, createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '~/modules/auth/components/login-form'
import { WEB_ROUTES } from '~/modules/shared/constants/routes'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Iniciar sesión · afterdark' }] }),
  component: LoginPage,
})

function LoginPage() {
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
        <div className="motion-reduce:animate-none animate-fade-up w-full max-w-sm">
          <LoginForm />
        </div>
      </main>

      <footer className="px-6 py-5 text-center">
        <p className="text-xs text-muted-foreground">© afterdark</p>
      </footer>
    </div>
  )
}
