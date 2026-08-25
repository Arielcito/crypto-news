'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileBarChart, ListChecks, Package as PackageIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { PackageForm } from '@/components/agencia/package-form';
import {
  AgencyCard,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
  ProgressBar,
} from '@/components/agencia/agency-ui';
import {
  useAgencyPackages,
  useCreatePackage,
  useDeletePackage,
  useUpdatePackage,
} from '@/lib/use-agency-packages';
import { useGenerateReport } from '@/lib/use-agency-reports';
import { formatDateAr, formatMonthLabel } from '@/lib/agency/dates';
import type { AgencyPackage, CreatePackageInput } from '@/lib/types/agency';

interface PackagesCardProps {
  clientId: number;
  canManage: boolean;
}

export function PackagesCard({ clientId, canManage }: PackagesCardProps) {
  const { data: packages = [], isLoading, isError, error } = useAgencyPackages(clientId);
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();
  const reportMutation = useGenerateReport();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<AgencyPackage | null>(null);

  const handleCreate = (input: CreatePackageInput) => {
    createMutation.mutate(input, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Paquete creado');
        setCreateOpen(false);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al crear'),
    });
  };

  const handleClose = (pkg: AgencyPackage) => {
    updateMutation.mutate(
      { id: pkg.id, input: { status: 'COMPLETED' } },
      {
        onSuccess: (response) => {
          if (response.error) {
            toast.error(response.message || response.error);
            return;
          }
          toast.success('Paquete cerrado');
        },
        onError: (mutationError) =>
          toast.error(mutationError instanceof Error ? mutationError.message : 'Error al cerrar'),
      }
    );
  };

  const handleReport = (pkg: AgencyPackage) => {
    reportMutation.mutate(pkg.id, {
      onSuccess: (response) => {
        if (response.error || !response.data) {
          toast.error(response.message || response.error || 'No se pudo generar el reporte');
          return;
        }
        toast.success('Reporte generado');
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al generar'),
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Paquete eliminado');
        setDeleting(null);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al eliminar'),
    });
  };

  return (
    <AgencyCard
      title="Paquetes mensuales"
      description="Cada paquete promete N piezas; el avance sale de las tareas cargadas."
      action={
        canManage ? (
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo paquete
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <ListSkeleton rows={2} height="h-20" />
      ) : isError ? (
        <ErrorNote error={error} resource="los paquetes" />
      ) : packages.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="Sin paquetes"
          description="Creá el paquete del mes para empezar a cargarle tareas."
        />
      ) : (
        <ul className="space-y-3">
          {packages.map((pkg) => {
            const complete = pkg.progress.done >= pkg.progress.committed;
            return (
              <li
                key={pkg.id}
                className="rounded-lg border p-3"
                style={{ borderColor: 'hsl(var(--admin-surface-border))' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-admin text-sm font-semibold capitalize tracking-tight">
                      {formatMonthLabel(pkg.month)}
                    </p>
                    <p className="text-xs" style={MUTED_STYLE}>
                      {pkg.status === 'COMPLETED' ? 'Cerrado' : 'Abierto'} · {pkg.progress.total} tareas cargadas
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/agencia/tareas?packageId=${pkg.id}`}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        Tareas
                      </Link>
                    </Button>
                    {canManage && pkg.status === 'OPEN' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClose(pkg)}
                        disabled={updateMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Cerrar
                      </Button>
                    )}
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReport(pkg)}
                        disabled={reportMutation.isPending}
                      >
                        <FileBarChart className="mr-2 h-4 w-4" />
                        Generar reporte
                      </Button>
                    )}
                    {canManage && pkg.reports.length === 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(pkg)}
                        aria-label={`Eliminar paquete de ${formatMonthLabel(pkg.month)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar done={pkg.progress.done} total={pkg.progress.committed} />
                  {!complete && pkg.status === 'COMPLETED' && (
                    <p className="mt-2 text-xs" style={{ color: 'hsl(var(--admin-warning))' }}>
                      Se cerró con {pkg.progress.committed - pkg.progress.done} piezas sin entregar.
                    </p>
                  )}
                </div>

                {pkg.reports.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pkg.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/admin/agencia/reportes/${report.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: 'hsl(var(--admin-accent) / 0.12)',
                          color: 'hsl(var(--admin-accent))',
                        }}
                      >
                        <FileBarChart className="h-3.5 w-3.5" />
                        Reporte del {formatDateAr(report.createdAt)}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo paquete</DialogTitle>
          </DialogHeader>
          <PackageForm
            clientId={clientId}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar paquete"
        description="Se borran también las tareas que tenga cargadas. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </AgencyCard>
  );
}
