import { useEffect } from 'react'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Toaster } from '@afterdark/ui'
import { I18nProvider } from '@afterdark/i18n/client'
import { installZodI18n } from '@afterdark/i18n'
import dashboardEs from '@afterdark/i18n/locales/dashboard/es.json'
import globalsCssUrl from '@afterdark/ui/globals.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: dashboardEs.brand.metaTitle },
    ],
    links: [{ rel: 'stylesheet', href: globalsCssUrl }],
  }),
  component: RootComponent,
})

function ZodI18nBridge() {
  const { t, ready } = useTranslation('validation', { useSuspense: false })
  useEffect(() => {
    if (ready) installZodI18n(t)
  }, [t, ready])
  return null
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <ZodI18nBridge />
        <html lang="es">
          <head>
            <HeadContent />
          </head>
          <body>
            <Outlet />
            <Toaster position="top-right" />
            <Scripts />
          </body>
        </html>
      </QueryClientProvider>
    </I18nProvider>
  )
}
