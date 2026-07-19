import { useQuery } from '@tanstack/react-query'
import { fetchBerries } from '../../services/berries'
import { queryKeys } from '../../query-keys'

// Berries rarely change, so a long staleTime is set globally in queryClient.ts.
export function useBerries() {
  return useQuery({
    queryKey: queryKeys.berries.all,
    queryFn: fetchBerries,
  })
}
