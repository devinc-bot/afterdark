import { createFileRoute, redirect } from '@tanstack/react-router'
import { DASHBOARD_ROUTES } from '../modules/shared/constants/routes'

export const Route = createFileRoute('/')({
  loader: () => {
    throw redirect({ to: DASHBOARD_ROUTES.properties() })
  },
})
