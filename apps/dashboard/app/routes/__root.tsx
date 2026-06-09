import {
  HeadContent,
  Outlet,
  Scripts,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "afterdark · Admin" },
    ],
    links: [{ rel: "stylesheet", href: "/globals.css" }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="es">
        <head>
          <HeadContent />
        </head>
        <body>
          <ScrollRestoration />
          <Outlet />
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}
