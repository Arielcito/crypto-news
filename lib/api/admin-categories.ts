import { adminFetch } from '@/lib/api/admin-client';
import type {
  AdminCategory,
  ApiResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/lib/types/admin';

export function fetchAdminCategories(): Promise<ApiResponse<AdminCategory[]>> {
  return adminFetch<ApiResponse<AdminCategory[]>>('/api/admin/categories');
}

export function createAdminCategory(
  input: CreateCategoryInput
): Promise<ApiResponse<AdminCategory>> {
  return adminFetch<ApiResponse<AdminCategory>>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminCategory(
  id: number,
  input: UpdateCategoryInput
): Promise<ApiResponse<AdminCategory>> {
  return adminFetch<ApiResponse<AdminCategory>>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteAdminCategory(id: number): Promise<ApiResponse<AdminCategory>> {
  return adminFetch<ApiResponse<AdminCategory>>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
}
