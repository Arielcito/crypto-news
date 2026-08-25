'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAgencyUser,
  fetchAgencyUserOptions,
  fetchAgencyUsers,
  resetAgencyUserPassword,
  updateAgencyUser,
} from '@/lib/api/agency';
import type { CreateUserInput, UpdateUserInput } from '@/lib/types/agency';

const KEY = ['admin', 'agency', 'users'] as const;
const OPTIONS_KEY = ['admin', 'agency', 'users', 'options'] as const;

export function useAgencyUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => fetchAgencyUsers(),
    select: (response) => response.data ?? [],
    retry: false,
  });
}

/** Para el select de responsable: lo puede pedir cualquiera con sesión. */
export function useAgencyUserOptions() {
  return useQuery({
    queryKey: OPTIONS_KEY,
    queryFn: () => fetchAgencyUserOptions(),
    select: (response) => response.data ?? [],
    retry: false,
  });
}

export function useCreateAgencyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createAgencyUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAgencyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      updateAgencyUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useResetUserPassword() {
  return useMutation({ mutationFn: (id: number) => resetAgencyUserPassword(id) });
}
