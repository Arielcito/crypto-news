import { adminFetch } from '@/lib/api/admin-client';
import type { ApiResponse, LoginInput } from '@/lib/types/admin';
import type { ChangePasswordInput } from '@/lib/types/agency';
import type { SessionUser } from '@/lib/admin-auth';

export function adminLogin(input: LoginInput): Promise<ApiResponse<SessionUser>> {
  return adminFetch<ApiResponse<SessionUser>>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function adminLogout(): Promise<ApiResponse<null>> {
  return adminFetch<ApiResponse<null>>('/api/admin/logout', {
    method: 'POST',
  });
}

export function fetchCurrentUser(): Promise<ApiResponse<SessionUser>> {
  return adminFetch<ApiResponse<SessionUser>>('/api/admin/me');
}

export function changePassword(input: ChangePasswordInput): Promise<ApiResponse<null>> {
  return adminFetch<ApiResponse<null>>('/api/admin/password', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
