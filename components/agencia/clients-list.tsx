'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, FileText, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientForm } from '@/components/agencia/client-form';
import {
  ADMIN_SURFACE_STYLE,
  ClientAvatar,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
  NetworkBadge,
} from '@/components/agencia/agency-ui';
import { useAgencyClients, useCreateClient } from '@/lib/use-agency-clients';
import { CLIENT_STATUS_LABELS } from '@/lib/types/agency';
import type { CreateClientInput } from '@/lib/types/agency';

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  ACTIVE: { bg: 'hsl(var(--admin-positive-bg))', fg: 'hsl(var(--admin-positive))' },
  PAUSED: { bg: 'hsl(var(--admin-warning-bg))', fg: 'hsl(var(--admin-warning))' },
  CHURNED: { bg: 'hsl(var(--admin-neutral-bg))', fg: 'hsl(var(--admin-neutral))' },
};

export function ClientsList({ canManage }: { canManage: boolean }) {
  const { data: clients = [], isLoading, isError, error } = useAgencyClients();
  const createMutation = useCreateClient();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = (input: CreateClientInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Cliente creado');
        setCreateOpen(false);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al crear'),
    });
  };

  if (isLoading) return <ListSkeleton rows={3} height="h-28" />;
  if (isError) return <ErrorNote error={error} resource="los clientes" />;

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay clientes todavía"
          description={
            canManage
              ? 'Creá el primero para empezar a cargar paquetes y tareas.'
              : 'Vas a ver acá los clientes en los que tengas tareas asignadas.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client, index) => {
            const status = STATUS_COLORS[client.status] ?? STATUS_COLORS.CHURNED;
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.03, ease: 'easeOut' }}
              >
                <Link
                  href={`/admin/agencia/clientes/${client.id}`}
                  className="flex h-full flex-col gap-3 rounded-lg border p-4 transition-colors hover:border-[hsl(var(--admin-accent))]"
                  style={ADMIN_SURFACE_STYLE}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <ClientAvatar name={client.name} seed={client.slug} />
                      <div className="min-w-0">
                        <p className="truncate font-admin text-base font-semibold tracking-tight">
                          {client.name}
                        </p>
                        <p className="truncate text-xs" style={MUTED_STYLE}>
                          /{client.slug}
                        </p>
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: status.bg, color: status.fg }}
                    >
                      {CLIENT_STATUS_LABELS[client.status]}
                    </span>
                  </div>

                  {client.profiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {client.profiles.map((profile) => (
                        <NetworkBadge key={profile.id} network={profile.network} />
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-4 text-xs" style={MUTED_STYLE}>
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      {client._count?.packages ?? 0} paquetes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {client._count?.briefs ?? 0} briefs
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            submitLabel="Crear cliente"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
