import { adminFetch } from '@/lib/api/admin-client';
import type { AdminTag, ApiResponse, CreateTagInput, UpdateTagInput } from '@/lib/types/admin';

export function fetchAdminTags(): Promise<ApiResponse<AdminTag[]>> {
  return adminFetch<ApiResponse<AdminTag[]>>('/api/admin/tags');
}

export function createAdminTag(input: CreateTagInput): Promise<ApiResponse<AdminTag>> {
  return adminFetch<ApiResponse<AdminTag>>('/api/admin/tags', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminTag(
  id: number,
  input: UpdateTagInput
): Promise<ApiResponse<AdminTag>> {
  return adminFetch<ApiResponse<AdminTag>>(`/api/admin/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteAdminTag(id: number): Promise<ApiResponse<AdminTag>> {
  return adminFetch<ApiResponse<AdminTag>>(`/api/admin/tags/${id}`, {
    method: 'DELETE',
  });
}
