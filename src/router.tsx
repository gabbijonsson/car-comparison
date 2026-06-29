import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { RouteError } from '~/components/layout/RouteError'
import { sv } from '~/lib/i18n/sv'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
  if (!CONVEX_URL) {
    console.error('missing envar VITE_CONVEX_URL')
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL ?? '')

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0, // Let React Query handle all caching
      defaultErrorComponent: RouteError,
      defaultNotFoundComponent: () => (
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <p className="text-muted-foreground">{sv.notFound.title}</p>
        </div>
      ),
      Wrap: ({ children }) => (
        <ConvexAuthProvider client={convexQueryClient.convexClient}>{children}</ConvexAuthProvider>
      ),
    }),
    queryClient,
  )

  return router
}
