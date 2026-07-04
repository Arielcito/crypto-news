'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PostForm } from '@/components/admin/post-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
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
        <Skeleton className="h-8 w-64" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
        <Skeleton className="h-96 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
        Nota no encontrada.
      </p>
    );
  }

  const categorySlug = data.data.categories[0]?.slug ?? 'notas';

  return (
    <div>
      <AdminPageHeader
        eyebrow="Contenido"
        title="Editar nota"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${categorySlug}/${data.data.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Vista previa
            </Link>
          </Button>
        }
      />
      <PostForm
        initialValues={data.data}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
