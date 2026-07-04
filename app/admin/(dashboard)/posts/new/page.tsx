'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PostForm } from '@/components/admin/post-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { useCreatePost } from '@/lib/use-admin-posts';
import type { CreatePostInput } from '@/lib/types/admin';

export default function NewPostPage() {
  const router = useRouter();
  const createMutation = useCreatePost();

  const handleSubmit = (input: CreatePostInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error || !response.data) {
          toast.error(response.message || response.error || 'Error al crear la nota');
          return;
        }
        toast.success('Nota creada');
        router.push('/admin/posts');
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear la nota'),
    });
  };

  return (
    <div>
      <AdminPageHeader eyebrow="Contenido" title="Nueva nota" />
      <PostForm onSubmit={handleSubmit} isPending={createMutation.isPending} submitLabel="Crear nota" />
    </div>
  );
}
