import { useEffect } from 'react'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Toaster } from '@afterdark/ui'
import { I18nProvider } from '@afterdark/i18n/client'
import { installZodI18n } from '@afterdark/i18n'
import dashboardEs from '@afterdark/i18n/locales/dashboard/es.json'
import { ErrorBoundaryView } from '~/modules/common/components/error-boundary-view'
import globalsCssUrl from '@afterdark/ui/globals.css?url'
import { DASHBOARD_ROUTES } from '~/modules/common/constants/routes'

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
  errorComponent: RootErrorBoundary,
  notFoundComponent: RootNotFound,
  component: RootComponent,
})

function RootErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation('dashboard')

  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorBoundaryView
          error={error}
          reset={reset}
          strings={{
            title: t('error.title'),
            description: t('error.description'),
            retry: t('error.retry'),
            goHome: t('error.goHome'),
            details: t('error.details'),
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  const { t } = useTranslation('dashboard')
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        <p className="font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
          AFTERDARK
        </p>
        <div className="mt-6 max-w-sm space-y-2">
          <p className="font-heading text-xl font-semibold text-ink">{t('notFound.title')}</p>
          <p className="text-sm text-ink-muted">{t('notFound.description')}</p>
        </div>
        <div className="mt-8">
          <Link
            to={DASHBOARD_ROUTES.home()}
            className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-5 text-[15px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {t('notFound.goHome')}
          </Link>
        </div>
        <Scripts />
      </body>
    </html>
  )
}

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
