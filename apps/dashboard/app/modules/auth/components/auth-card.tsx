import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'

const AUTH_TAB = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const

type AuthTab = (typeof AUTH_TAB)[keyof typeof AUTH_TAB]

export function AuthCard() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const activeTab: AuthTab =
    pathname === DASHBOARD_ROUTES.register() ? AUTH_TAB.REGISTER : AUTH_TAB.LOGIN

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        void navigate({
          to: value === AUTH_TAB.REGISTER ? DASHBOARD_ROUTES.register() : DASHBOARD_ROUTES.login(),
        })
      }}
    >
      <TabsList variant="line" className="mb-7 grid w-full grid-cols-2">
        <TabsTrigger variant="line" value={AUTH_TAB.LOGIN}>
          {t('tabs.login')}
        </TabsTrigger>
        <TabsTrigger variant="line" value={AUTH_TAB.REGISTER}>
          {t('tabs.register')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value={AUTH_TAB.LOGIN} className="mt-0">
        <LoginForm />
      </TabsContent>

      <TabsContent value={AUTH_TAB.REGISTER} className="mt-0">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  )
}
