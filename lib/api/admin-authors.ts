import { adminFetch } from '@/lib/api/admin-client';
import type { AdminAuthor, ApiResponse } from '@/lib/types/admin';

export function fetchAdminAuthors(): Promise<ApiResponse<AdminAuthor[]>> {
  return adminFetch<ApiResponse<AdminAuthor[]>>('/api/admin/authors');
}
