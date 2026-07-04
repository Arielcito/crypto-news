import { adminUpload } from '@/lib/api/admin-client';
import type { ApiResponse } from '@/lib/types/admin';

export function uploadAdminMedia(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append('file', file);
  return adminUpload<ApiResponse<{ url: string }>>('/api/admin/upload', formData);
}
