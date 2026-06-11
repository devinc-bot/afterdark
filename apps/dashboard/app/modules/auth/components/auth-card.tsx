import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '../../shared/constants/routes'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
const AUTH_TAB = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const

type AuthTab = (typeof AUTH_TAB)[keyof typeof AUTH_TAB]

export function AuthCard() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const activeTab: AuthTab =
    pathname === DASHBOARD_ROUTES.register() ? AUTH_TAB.REGISTER : AUTH_TAB.LOGIN

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-6 shadow-glass md:p-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          void navigate({
            to:
              value === AUTH_TAB.REGISTER ? DASHBOARD_ROUTES.register() : DASHBOARD_ROUTES.login(),
          })
        }}
      >
        <TabsList variant="line" className="mb-6 grid grid-cols-2">
          <TabsTrigger variant="line" value={AUTH_TAB.LOGIN}>
            Entrar
          </TabsTrigger>
          <TabsTrigger variant="line" value={AUTH_TAB.REGISTER}>
            Registrarse
          </TabsTrigger>
        </TabsList>

        <TabsContent value={AUTH_TAB.LOGIN} className="mt-0">
          <LoginForm />
        </TabsContent>

        <TabsContent value={AUTH_TAB.REGISTER} className="mt-0">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
