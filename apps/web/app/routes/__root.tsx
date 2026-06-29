import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { I18nProvider } from '@afterdark/i18n/client'
import globalsCssUrl from '@afterdark/ui/globals.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'afterdark' },
    ],
    links: [{ rel: 'stylesheet', href: globalsCssUrl }],
  }),
  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <html lang="es">
          <head>
            <HeadContent />
          </head>
          <body>
            <Outlet />
            <Scripts />
          </body>
        </html>
      </QueryClientProvider>
    </I18nProvider>
  )
}
