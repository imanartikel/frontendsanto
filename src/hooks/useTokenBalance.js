import { useQuery } from '@tanstack/react-query'
import { tokensApi } from '../api/tokens'
import useAuthStore from '../store/authStore'

export function useTokenBalance() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const query = useQuery({
    queryKey: ['tokenBalance'],
    queryFn: () => tokensApi.balance().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30_000, // re-poll every 30s to stay fresh after generations
    staleTime: 15_000,
  })

  return {
    balance: query.data?.balance ?? null,
    updatedAt: query.data?.updated_at ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
