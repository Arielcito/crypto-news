'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner';
import { Eye, FileX2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { StatusBadge } from '@/components/admin/status-badge';
import { ADMIN_INPUT_CLASS } from '@/lib/constants';
import { useAdminPosts, useDeletePost } from '@/lib/use-admin-posts';
import type { AdminPost } from '@/lib/types/admin';

const ADMIN_SURFACE_STYLE = {
  backgroundColor: 'hsl(var(--admin-surface))',
  borderColor: 'hsl(var(--admin-surface-border))',
  color: 'hsl(var(--admin-surface-foreground))',
};

function previewUrl(post: AdminPost): string {
  const categorySlug = post.categories[0]?.slug ?? 'notas';
  return `/${categorySlug}/${post.slug}`;
}

export function PostsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminPost | null>(null);

  const { data, isLoading, isError, error } = useAdminPosts({ page, perPage: 10, search, status });
  const deleteMutation = useDeletePost();

  const posts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Nota eliminada');
        setDeleting(null);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Error al eliminar'),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'hsl(var(--admin-muted-foreground))' }}
            />
            <Input
              type="text"
              placeholder="Buscar notas..."
              className={`pl-9 ${ADMIN_INPUT_CLASS}`}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            value={status ?? 'all'}
            onValueChange={(value) => {
              setStatus(value === 'all' ? undefined : value);
              setPage(1);
            }}
          >
            <SelectTrigger className={`sm:w-40 ${ADMIN_INPUT_CLASS}`}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent style={ADMIN_SURFACE_STYLE}>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="publish">Publicado</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva nota
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
          <Skeleton className="h-16 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
          <Skeleton className="h-16 w-full" style={{ backgroundColor: 'hsl(var(--admin-surface-border))' }} />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Error al cargar las notas: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      ) : posts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center"
          style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
        >
          <FileX2 className="h-8 w-8" style={{ color: 'hsl(var(--admin-muted-foreground))' }} />
          <p className="text-sm font-medium">No se encontraron notas</p>
          <p className="text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
            Probá con otra búsqueda o creá la primera.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {posts.map((post) => (
              <Card key={post.id} style={ADMIN_SURFACE_STYLE} className="shadow-none">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-tight">{post.title}</p>
                    <StatusBadge status={post.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                    {post.authorRef?.name ?? 'Sin autor'} · {new Date(post.date).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={previewUrl(post)} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-1 h-3 w-3" />
                        Vista previa
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleting(post)}>
                      <Trash2 className="mr-1 h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block" style={ADMIN_SURFACE_STYLE}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-md truncate font-medium">{post.title}</TableCell>
                    <TableCell style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                      {post.authorRef?.name ?? 'Sin autor'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                      {new Date(post.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={previewUrl(post)} target="_blank" rel="noopener noreferrer" aria-label="Vista previa">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/posts/${post.id}/edit`} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(post)} aria-label="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm" style={{ color: 'hsl(var(--admin-muted-foreground))' }}>
                Página {page} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar nota"
        description={`¿Seguro que querés eliminar "${deleting?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
