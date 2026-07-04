import { adminFetch } from '@/lib/api/admin-client';
import type { ApiResponse, LoginInput } from '@/lib/types/admin';

export function adminLogin(input: LoginInput): Promise<ApiResponse<{ username: string }>> {
  return adminFetch<ApiResponse<{ username: string }>>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function adminLogout(): Promise<ApiResponse<null>> {
  return adminFetch<ApiResponse<null>>('/api/admin/logout', {
    method: 'POST',
  });
}
