import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import type { Decorator } from '@storybook/react-vite'

export const withRouter: Decorator = (Story, _context) => {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  })

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Story,
  })

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: () => null,
  })

  const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  return <RouterProvider router={router} />
}
