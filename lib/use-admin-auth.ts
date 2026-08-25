'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminLogin,
  adminLogout,
  changePassword,
  fetchCurrentUser,
} from '@/lib/api/admin-auth';
import type { LoginInput } from '@/lib/types/admin';
import type { ChangePasswordInput } from '@/lib/types/agency';

export function useAdminLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => adminLogin(input),
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminLogout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/** Quién soy. El rol sale de acá, no de la cookie, para decidir qué muestra la UI. */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => fetchCurrentUser(),
    retry: false,
    staleTime: 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
  });
}
