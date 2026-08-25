'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAgencyPackage,
  deleteAgencyPackage,
  fetchAgencyPackages,
  updateAgencyPackage,
} from '@/lib/api/agency';
import type { CreatePackageInput, UpdatePackageInput } from '@/lib/types/agency';

const KEY = ['admin', 'agency', 'packages'] as const;

export function useAgencyPackages(clientId?: number) {
  return useQuery({
    queryKey: [...KEY, clientId ?? 'all'],
    queryFn: () => fetchAgencyPackages(clientId),
    select: (response) => response.data ?? [],
    retry: false,
  });
}

/** Tocar un paquete cambia el progreso que se ve en tareas: se invalidan las dos. */
function usePackageMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'agency', 'tasks'] });
    },
  });
}

export function useCreatePackage() {
  return usePackageMutation((input: CreatePackageInput) => createAgencyPackage(input));
}

export function useUpdatePackage() {
  return usePackageMutation(({ id, input }: { id: number; input: UpdatePackageInput }) =>
    updateAgencyPackage(id, input)
  );
}

export function useDeletePackage() {
  return usePackageMutation((id: number) => deleteAgencyPackage(id));
}
