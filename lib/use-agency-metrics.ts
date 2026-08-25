'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOrganicMetrics, syncSocialNow } from '@/lib/api/agency';
import type { MetricsRange } from '@/lib/types/agency';

const KEY = ['admin', 'agency', 'metrics'] as const;

export function useOrganicMetrics(days: MetricsRange, clientId?: number) {
  return useQuery({
    queryKey: [...KEY, days, clientId ?? 'all'],
    queryFn: () => fetchOrganicMetrics(days, clientId),
    select: (response) => response.data,
    // El cron sincroniza cada 6 h: refetchear seguido sólo golpea la base para
    // traer exactamente lo mismo.
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSyncSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncSocialNow(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
