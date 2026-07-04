'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminLogin, adminLogout } from '@/lib/api/admin-auth';
import type { LoginInput } from '@/lib/types/admin';

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
