import { QueryClient } from '@tanstack/react-query'

// A single QueryClient for the whole app. Defaults tuned so our
// mocked berry catalog isn't re-fetched constantly during play.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
