import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { Toaster } from '@afterdark/ui'
import globalsCssUrl from '@afterdark/ui/globals.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Afterdark · Panel' },
    ],
    links: [{ rel: 'stylesheet', href: globalsCssUrl }],
  }),
  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <QueryClientProvider client={queryClient}>
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
  )
}
