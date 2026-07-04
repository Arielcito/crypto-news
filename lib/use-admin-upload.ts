'use client';

import { useMutation } from '@tanstack/react-query';
import { uploadAdminMedia } from '@/lib/api/admin-upload';

export function useUploadMedia() {
  return useMutation({
    mutationFn: (file: File) => uploadAdminMedia(file),
  });
}
