'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAgencyReport,
  fetchAgencyReport,
  fetchAgencyReports,
  generateAgencyReport,
} from '@/lib/api/agency';

const KEY = ['admin', 'agency', 'reports'] as const;

export function useAgencyReports(clientId?: number) {
  return useQuery({
    queryKey: [...KEY, clientId ?? 'all'],
    queryFn: () => fetchAgencyReports(clientId),
    select: (response) => response.data ?? [],
    retry: false,
  });
}

export function useAgencyReport(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchAgencyReport(id as number),
    select: (response) => response.data,
    enabled: id !== null,
    // El snapshot está congelado: una vez traído no cambia nunca más.
    staleTime: Infinity,
    retry: false,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: number) => generateAgencyReport(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'agency', 'packages'] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAgencyReport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
