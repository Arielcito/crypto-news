'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileBarChart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import {
  ADMIN_SURFACE_STYLE,
  AGENCY_SELECT_CLASS,
  ClientAvatar,
  EmptyState,
  ErrorNote,
  ListSkeleton,
  MUTED_STYLE,
} from '@/components/agencia/agency-ui';
import { useAgencyReports, useDeleteReport } from '@/lib/use-agency-reports';
import { useAgencyClients } from '@/lib/use-agency-clients';
import { formatDateTimeAr, formatMonthLabel } from '@/lib/agency/dates';
import type { AgencyReportSummary } from '@/lib/types/agency';

export function ReportsList({ canManage }: { canManage: boolean }) {
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  const { data: reports = [], isLoading, isError, error } = useAgencyReports(clientId);
  const { data: clients = [] } = useAgencyClients();
  const deleteMutation = useDeleteReport();
  const [deleting, setDeleting] = useState<AgencyReportSummary | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(response.message || response.error);
          return;
        }
        toast.success('Reporte eliminado');
        setDeleting(null);
      },
      onError: (mutationError) =>
        toast.error(mutationError instanceof Error ? mutationError.message : 'Error al eliminar'),
    });
  };

  return (
    <div className="space-y-5">
      <select
        className={`${AGENCY_SELECT_CLASS} sm:w-64`}
        value={clientId ?? ''}
        onChange={(event) => setClientId(event.target.value ? Number(event.target.value) : undefined)}
        aria-label="Filtrar por cliente"
      >
        <option value="">Todos los clientes</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {isLoading ? (
        <ListSkeleton rows={3} height="h-16" />
      ) : isError ? (
        <ErrorNote error={error} resource="los reportes" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="Todavía no hay reportes"
          description="Se generan desde la ficha del cliente, cuando el paquete del mes está entregado."
        />
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              style={ADMIN_SURFACE_STYLE}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ClientAvatar name={report.package.client.name} />
                <div className="min-w-0">
                  <Link
                    href={`/admin/agencia/reportes/${report.id}`}
                    className="font-admin text-sm font-semibold tracking-tight hover:underline"
                  >
                    {report.package.client.name} · <span className="capitalize">{formatMonthLabel(report.package.month)}</span>
                  </Link>
                  <p className="text-xs" style={MUTED_STYLE}>
                    Generado {formatDateTimeAr(report.createdAt)}
                    {report.generatedBy ? ` por ${report.generatedBy.name}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/agencia/reportes/${report.id}`}>Abrir</Link>
                </Button>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(report)}
                    aria-label="Eliminar reporte"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar reporte"
        description="El reporte es una foto congelada de ese mes: si se borra, hay que regenerarlo con los números de hoy, que ya no son los mismos."
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
