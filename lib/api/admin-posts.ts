import { adminFetch } from '@/lib/api/admin-client';
import type {
  AdminPost,
  ApiResponse,
  PaginatedResponse,
  CreatePostInput,
  UpdatePostInput,
} from '@/lib/types/admin';

export interface FetchAdminPostsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
}

export function fetchAdminPosts({
  page = 1,
  perPage = 10,
  search = '',
  status,
}: FetchAdminPostsParams = {}): Promise<PaginatedResponse<AdminPost>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  return adminFetch<PaginatedResponse<AdminPost>>(`/api/admin/posts?${params.toString()}`);
}

export function fetchAdminPost(id: number): Promise<ApiResponse<AdminPost>> {
  return adminFetch<ApiResponse<AdminPost>>(`/api/admin/posts/${id}`);
}

export function createAdminPost(input: CreatePostInput): Promise<ApiResponse<AdminPost>> {
  return adminFetch<ApiResponse<AdminPost>>('/api/admin/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminPost(
  id: number,
  input: UpdatePostInput
): Promise<ApiResponse<AdminPost>> {
  return adminFetch<ApiResponse<AdminPost>>(`/api/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteAdminPost(id: number): Promise<ApiResponse<AdminPost>> {
  return adminFetch<ApiResponse<AdminPost>>(`/api/admin/posts/${id}`, {
    method: 'DELETE',
  });
}
