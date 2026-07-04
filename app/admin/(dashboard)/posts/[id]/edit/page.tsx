'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PostForm } from '@/components/admin/post-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminPost, useUpdatePost } from '@/lib/use-admin-posts';
import type { CreatePostInput } from '@/lib/types/admin';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const postId = Number(params.id);
  const { data, isLoading } = useAdminPost(postId);
  const updateMutation = useUpdatePost();

  const handleSubmit = (input: CreatePostInput) => {
    updateMutation.mutate(
      { id: postId, input },
      {
        onSuccess: (response) => {
          if (response.error || !response.data) {
            toast.error(response.message || response.error || 'Error al actualizar la nota');
            return;
          }
          toast.success('Nota actualizada');
          router.push('/admin/posts');
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al actualizar la nota'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data?.data) {
    return <p className="text-sm text-muted-foreground">Nota no encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar nota</h1>
      <PostForm
        initialValues={data.data}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
