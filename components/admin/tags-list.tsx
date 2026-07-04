'use client';

import { useState } from 'react';
import { Pencil, Plus, Tags as TagsIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TagForm } from '@/components/admin/tag-form';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import {
  useAdminTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/lib/use-admin-tags';
import type { AdminTag, CreateTagInput } from '@/lib/types/admin';

const ADMIN_SURFACE_STYLE = {
  backgroundColor: 'hsl(var(--admin-surface))',
  borderColor: 'hsl(var(--admin-surface-border))',
  color: 'hsl(var(--admin-surface-foreground))',
};

export function TagsList() {
  const { data, isLoading, isError, error } = useAdminTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTag | null>(null);
  const [deleting, setDeleting] = useState<AdminTag | null>(null);

  const tags = data?.data ?? [];

  const handleCreate = (input: CreateTagInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Tag creado');
        setCreateOpen(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear'),
    });
  };

  const handleUpdate = (input: CreateTagInput) => {
    if (!editing) return;
    updateMutation.mutate(
      { id: editing.id, input },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Tag actualizado');
          setEditing(null);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al actualizar'),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Tag eliminado');
        setDeleting(null);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al eliminar'),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo tag
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
          <Skeleton className="h-10 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
          <Skeleton className="h-10 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Error al cargar los tags: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      ) : tags.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center"
          style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
        >
          <TagsIcon className="h-8 w-8" style={{ color: 'hsl(var(--admin-muted-foreground))' }} />
          <p className="text-sm font-medium">No hay tags todavía</p>
          <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
            Creá el primero para empezar a etiquetar tus notas.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border" style={ADMIN_SURFACE_STYLE}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell style={{ color: 'hsl(var(--admin-muted-foreground))' }}>{tag.slug}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(tag)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(tag)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo tag</DialogTitle>
          </DialogHeader>
          <TagForm onSubmit={handleCreate} isPending={createMutation.isPending} submitLabel="Crear" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tag</DialogTitle>
          </DialogHeader>
          {editing && (
            <TagForm
              initialValues={editing}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              submitLabel="Actualizar"
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar tag"
        description={`¿Seguro que querés eliminar "${deleting?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
