'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminAuthors } from '@/lib/api/admin-authors';

export function useAdminAuthors() {
  return useQuery({
    queryKey: ['admin', 'authors'],
    queryFn: () => fetchAdminAuthors(),
    staleTime: 5 * 60 * 1000,
  });
}
