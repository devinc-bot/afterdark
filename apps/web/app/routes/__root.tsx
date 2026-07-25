import { useEffect } from 'react'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { installZodI18n } from '@repo/i18n'
import { I18nProvider } from '@repo/i18n/client'
import commonEs from '@repo/i18n/locales/common/es.json'
import { APP_LOGO_SRC, THEME_BOOT_SCRIPT, ThemeProvider, Toaster } from '@repo/ui'
import globalsCssUrl from '@repo/ui/globals.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: commonEs.appName },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: APP_LOGO_SRC },
      { rel: 'apple-touch-icon', href: APP_LOGO_SRC },
      { rel: 'stylesheet', href: globalsCssUrl },
    ],
    scripts: [{ children: THEME_BOOT_SCRIPT }],
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

function DocumentLang() {
  const { i18n } = useTranslation()
  useEffect(() => {
    document.documentElement.lang = i18n.language || 'es'
  }, [i18n.language])
  return null
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <I18nProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ZodI18nBridge />
          <DocumentLang />
          <html lang="es" data-theme="dark">
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
      </ThemeProvider>
    </I18nProvider>
  )
}
