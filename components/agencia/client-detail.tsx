'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, ArrowLeft, BarChart3, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { ClientForm } from '@/components/agencia/client-form';
import { ClientProfilesCard } from '@/components/agencia/client-profiles-card';
import { BriefsCard } from '@/components/agencia/briefs-card';
import { PackagesCard } from '@/components/agencia/packages-card';
import {
  ClientAvatar,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
} from '@/components/agencia/agency-ui';
import { useAgencyClient, useArchiveClient, useUpdateClient } from '@/lib/use-agency-clients';
import { CLIENT_STATUS_LABELS } from '@/lib/types/agency';
import type { CreateClientInput } from '@/lib/types/agency';

export function ClientDetail({ clientId, canManage }: { clientId: number; canManage: boolean }) {
  const router = useRouter();
  const { data: client, isLoading, isError, error } = useAgencyClient(clientId);
  const updateMutation = useUpdateClient();
  const archiveMutation = useArchiveClient();
  const [editOpen, setEditOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  if (isLoading) return <ListSkeleton rows={4} height="h-24" />;
  if (isError) return <ErrorNote error={error} resource="el cliente" />;
  if (!client) return <ErrorNote error={new Error('Cliente no encontrado')} resource="el cliente" />;

  const handleUpdate = (input: CreateClientInput) => {
    updateMutation.mutate(
      { id: clientId, input },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Cliente actualizado');
          setEditOpen(false);
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al actualizar'),
      }
    );
  };

  const handleArchive = () => {
    archiveMutation.mutate(clientId, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Cliente archivado');
        setArchiving(false);
        router.push('/admin/agencia/clientes');
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al archivar'),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/agencia/clientes"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={MUTED_STYLE}
        >
          <ArrowLeft className="h-4 w-4" />
          Clientes
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/agencia/organico?clientId=${clientId}`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver orgánico
            </Link>
          </Button>
          {canManage && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setArchiving(true)}>
                <Archive className="mr-2 h-4 w-4" />
                Archivar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <ClientAvatar name={client.name} seed={client.slug} size="lg" />
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-[0.14em]"
            style={{ color: 'hsl(var(--admin-accent))' }}
          >
            {CLIENT_STATUS_LABELS[client.status]}
          </p>
          <h1 className="font-admin mt-1 text-3xl font-semibold tracking-tight">{client.name}</h1>
          {client.notes && (
            <p className="mt-2 max-w-2xl whitespace-pre-line text-sm" style={MUTED_STYLE}>
              {client.notes}
            </p>
          )}
        </div>
      </div>

      <ClientProfilesCard clientId={clientId} profiles={client.profiles} canManage={canManage} />
      <PackagesCard clientId={clientId} canManage={canManage} />
      <BriefsCard clientId={clientId} briefs={client.briefs} canManage={canManage} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            initialValues={{ ...client, profiles: client.profiles }}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
            submitLabel="Guardar cambios"
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={archiving}
        onOpenChange={setArchiving}
        title="Archivar cliente"
        description="Deja de aparecer en los listados y pasa a estado Baja. Los paquetes y reportes se conservan."
        onConfirm={handleArchive}
        isPending={archiveMutation.isPending}
      />
    </div>
  );
}
