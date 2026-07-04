'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminPosts,
  fetchAdminPost,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
  FetchAdminPostsParams,
} from '@/lib/api/admin-posts';
import type { CreatePostInput, UpdatePostInput } from '@/lib/types/admin';

export function useAdminPosts(params: FetchAdminPostsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'posts', params],
    queryFn: () => fetchAdminPosts(params),
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useAdminPost(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'post', id],
    queryFn: () => fetchAdminPost(id as number),
    enabled: id !== undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => createAdminPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePostInput }) => updateAdminPost(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'post', id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });
}
