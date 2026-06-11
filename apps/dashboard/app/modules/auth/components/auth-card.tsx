import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@afterdark/ui'
import { DASHBOARD_ROUTES } from '../../shared/constants/routes'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { SocialAuthButtons } from './social-auth-buttons'

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
    <div className="glass-card neon-border-primary rounded-xl p-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          void navigate({
            to:
              value === AUTH_TAB.REGISTER ? DASHBOARD_ROUTES.register() : DASHBOARD_ROUTES.login(),
          })
        }}
      >
        <TabsList variant="line" className="mb-8 grid grid-cols-2">
          <TabsTrigger
            variant="line"
            value={AUTH_TAB.LOGIN}
            className="data-[state=active]:border-b-primary data-[state=active]:border-b-2"
          >
            Entrar
          </TabsTrigger>
          <TabsTrigger
            variant="line"
            value={AUTH_TAB.REGISTER}
            className="data-[state=active]:border-b-primary data-[state=active]:border-b-2"
          >
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

      <SocialAuthButtons />
    </div>
  )
}
