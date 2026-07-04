'use client';

import { useState } from 'react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { CategoryForm } from '@/components/admin/category-form';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/use-admin-categories';
import type { AdminCategory, CreateCategoryInput } from '@/lib/types/admin';

const ADMIN_SURFACE_STYLE = {
  backgroundColor: 'hsl(var(--admin-surface))',
  borderColor: 'hsl(var(--admin-surface-border))',
  color: 'hsl(var(--admin-surface-foreground))',
};

export function CategoriesList() {
  const { data, isLoading, isError, error } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  const categories = data?.data ?? [];

  const handleCreate = (input: CreateCategoryInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Categoría creada');
        setCreateOpen(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al crear'),
    });
  };

  const handleUpdate = (input: CreateCategoryInput) => {
    if (!editing) return;
    updateMutation.mutate(
      { id: editing.id, input },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Categoría actualizada');
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
        toast.success('Categoría eliminada');
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
          Nueva categoría
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
          Error al cargar las categorías: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      ) : categories.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center"
          style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
        >
          <FolderTree className="h-8 w-8" style={{ color: 'hsl(var(--admin-muted-foreground))' }} />
          <p className="text-sm font-medium">No hay categorías todavía</p>
          <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
            Creá la primera para empezar a ordenar tus notas.
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
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                    {category.slug}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleting(category)}>
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
            <DialogTitle>Nueva categoría</DialogTitle>
          </DialogHeader>
          <CategoryForm onSubmit={handleCreate} isPending={createMutation.isPending} submitLabel="Crear" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
          </DialogHeader>
          {editing && (
            <CategoryForm
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
        title="Eliminar categoría"
        description={`¿Seguro que querés eliminar "${deleting?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
