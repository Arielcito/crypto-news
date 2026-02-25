'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedPosts, PaginatedPostsResponse } from '@/lib/api/posts';

interface UsePaginatedPostsOptions {
  perPage?: number;
}

export function usePaginatedPosts({ perPage = 2 }: UsePaginatedPostsOptions = {}) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery<PaginatedPostsResponse>({
    queryKey: ['paginatedPosts', page, perPage],
    queryFn: () => fetchPaginatedPosts({ page, perPage }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const goToPage = useCallback((p: number) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(page + 1), [page, goToPage]);
  const prevPage = useCallback(() => goToPage(page - 1), [page, goToPage]);

  return {
    posts,
    total,
    totalPages,
    page,
    perPage,
    isLoading,
    isPageTransitioning: isFetching && !isLoading,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
