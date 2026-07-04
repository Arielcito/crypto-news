'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminTags,
  createAdminTag,
  updateAdminTag,
  deleteAdminTag,
} from '@/lib/api/admin-tags';
import type { CreateTagInput, UpdateTagInput } from '@/lib/types/admin';

export function useAdminTags() {
  return useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: () => fetchAdminTags(),
    retry: false,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) => createAdminTag(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTagInput }) => updateAdminTag(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
  });
}
